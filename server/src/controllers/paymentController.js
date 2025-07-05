import { Payment, Order, Invoice } from '../models/index.js';
import logger from '../utils/logger.js';
import Stripe from 'stripe';
import { calculatePartialPaymentSchedule } from '../utils/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency, isPartialPayment, paymentScheduleIndex } = req.body;
    const userId = req.user.id;

    if (!orderId || !amount || !currency) {
      return res.status(400).json({ error: 'Order ID, amount, and currency are required.' });
    }

    const order = await Order.findByPk(orderId);
    if (!order || order.user_id !== userId) {
      return res.status(404).json({ error: 'Order not found or unauthorized.' });
    }

    // Ensure the amount is valid for the order (e.g., not exceeding remaining balance)
    const invoice = await Invoice.findOne({ where: { order_id: orderId } });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found for this order.' });
    }

    let paymentAmount = parseFloat(amount);
    let paymentDescription = `Payment for Order ${order.order_number}`;

    if (isPartialPayment) {
      if (!order.is_partial_payment_allowed || paymentScheduleIndex === undefined) {
        return res.status(400).json({ error: 'Partial payments not allowed or schedule index missing.' });
      }
      const scheduleItem = order.payment_schedule[paymentScheduleIndex];
      if (!scheduleItem || paymentAmount !== scheduleItem.amount) {
        return res.status(400).json({ error: 'Invalid partial payment amount or schedule index.' });
      }
      paymentDescription = `Partial payment (${scheduleItem.phase}) for Order ${order.order_number}`;
    } else if (paymentAmount > invoice.remaining_amount) {
      return res.status(400).json({ error: 'Payment amount exceeds remaining balance.' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentAmount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        order_id: orderId,
        user_id: userId,
        is_partial_payment: isPartialPayment ? 'true' : 'false',
        payment_schedule_index: isPartialPayment ? paymentScheduleIndex.toString() : undefined,
      },
      description: paymentDescription,
    });

    // Create a pending payment record in our DB
    const payment = await Payment.create({
      order_id: orderId,
      payment_intent_id: paymentIntent.id,
      amount: paymentAmount,
      currency: currency,
      payment_method: 'stripe', // Assuming Stripe for now
      status: 'pending',
      is_partial_payment: isPartialPayment,
      payment_schedule_index: paymentScheduleIndex,
    });

    logger.info(`Payment Intent created for order ${orderId}: ${paymentIntent.id}`);
    res.json({ clientSecret: paymentIntent.client_secret, paymentId: payment.id });

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      logger.info(`PaymentIntent for ${paymentIntentSucceeded.amount} was successful!`);
      // Update payment status in DB
      await updatePaymentStatus(paymentIntentSucceeded.id, 'succeeded', paymentIntentSucceeded.latest_charge);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      logger.warn(`PaymentIntent for ${paymentIntentFailed.amount} failed! Reason: ${paymentIntentFailed.last_payment_error?.message}`);
      await updatePaymentStatus(paymentIntentFailed.id, 'failed', null, paymentIntentFailed.last_payment_error?.message);
      break;
    case 'charge.refunded':
      const chargeRefunded = event.data.object;
      logger.info(`Charge ${chargeRefunded.id} was refunded!`);
      await updatePaymentStatus(chargeRefunded.payment_intent, 'refunded', chargeRefunded.id, null, chargeRefunded.amount_refunded / 100);
      break;
    // ... handle other event types
    default:
      logger.info(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const updatePaymentStatus = async (paymentIntentId, status, chargeId = null, failureReason = null, refundAmount = null) => {
  try {
    const payment = await Payment.findOne({ where: { payment_intent_id: paymentIntentId } });
    if (!payment) {
      logger.warn(`Payment record not found for intent ID: ${paymentIntentId}`);
      return;
    }

    const updateData = {
      status: status,
      transaction_id: chargeId || payment.transaction_id,
      failure_reason: failureReason,
      refund_amount: refundAmount,
      paid_at: status === 'succeeded' ? new Date().toISOString() : payment.paid_at,
    };

    await payment.update(updateData);
    logger.info(`Payment ${payment.id} status updated to ${status}`);

    // Update associated invoice status
    const invoice = await Invoice.findOne({ where: { order_id: payment.order_id } });
    if (invoice) {
      const newPaidAmount = parseFloat(invoice.paid_amount) + parseFloat(payment.amount);
      const newRemainingAmount = parseFloat(invoice.total_amount) - newPaidAmount;
      let invoiceStatus = invoice.status;

      if (newRemainingAmount <= 0) {
        invoiceStatus = 'paid';
      } else if (newPaidAmount > 0) {
        invoiceStatus = 'partially_paid';
      }

      await invoice.update({
        status: invoiceStatus,
        paid_amount: newPaidAmount,
        remaining_amount: newRemainingAmount,
        paid_at: invoiceStatus === 'paid' ? new Date().toISOString() : invoice.paid_at,
      });
      logger.info(`Invoice ${invoice.invoice_number} status updated to ${invoiceStatus}`);
    }

    // TODO: Trigger order status update if payment is final/full

  } catch (error) {
    logger.error(`Error updating payment status for intent ${paymentIntentId}:`, error);
  }
};

const getPaymentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = await Order.findByPk(orderId);
    if (!order || (userRole !== 'Admin' && order.user_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized or order not found.' });
    }

    const payments = await Payment.findAll({ where: { order_id: orderId }, order: [['created_at', 'DESC']] });

    res.json({ payments });
  } catch (error) {
    logger.error('Get payments by order error:', error);
    res.status(500).json({ error: 'Failed to retrieve payments.' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const order = await Order.findByPk(invoice.order_id);
    if (!order || (userRole !== 'Admin' && order.user_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized or invoice not found for your orders.' });
    }

    res.json({ invoice });
  } catch (error) {
    logger.error('Get invoice by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoice.' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    if (status) filters.status = status;

    // Non-admins can only see their own invoices
    if (userRole !== 'Admin') {
      const userOrders = await Order.findAll({ where: { user_id: userId }, attributes: ['id'] });
      const orderIds = userOrders.map(order => order.id);
      if (orderIds.length === 0) {
        return res.json({ invoices: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } });
      }
      filters.order_id = orderIds; // Filter by order IDs
    }

    logger.info(`Fetching invoices with filters: ${JSON.stringify(filters)} by user ${userId} (${userRole})`);

    const result = await Invoice.findAndCountAll(filters);

    res.json({
      invoices: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices.' });
  }
};

// TODO: Implement PDF generation for invoices
const generateInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }

    const order = await Order.findByPk(invoice.order_id);
    if (!order || (userRole !== 'Admin' && order.user_id !== userId)) {
      return res.status(403).json({ error: 'Unauthorized or invoice not found for your orders.' });
    }

    // This is a placeholder. Actual PDF generation would use pdf-lib or similar.
    const pdfContent = `Simulated PDF for Invoice ${invoice.invoice_number}`;
    const filename = `invoice-${invoice.invoice_number}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfContent);

    logger.info(`Simulated PDF generation for invoice ${invoice.invoice_number}`);

  } catch (error) {
    logger.error('Generate invoice PDF error:', error);
    res.status(500).json({ error: 'Failed to generate invoice PDF.' });
  }
};

export {
  createPaymentIntent,
  handleStripeWebhook,
  getPaymentsByOrder,
  getInvoiceById,
  getInvoices,
  generateInvoicePdf,
};
