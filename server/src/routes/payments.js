import express from 'express';
import {
  createPaymentIntent,
  handleStripeWebhook,
  getPaymentsByOrder,
  getInvoiceById,
  getInvoices,
  generateInvoicePdf,
} from '../controllers/paymentController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Payment Intent creation (authenticated users)
router.post('/create-payment-intent', auth, createPaymentIntent);

// Stripe Webhook (public, Stripe will call this)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Get payments for a specific order (authenticated users)
router.get('/order/:orderId', auth, getPaymentsByOrder);

// Get a specific invoice by ID (authenticated users)
router.get('/invoices/:id', auth, getInvoiceById);

// Get all invoices (authenticated users, with admin authorization for all)
router.get('/invoices', auth, getInvoices);

// Generate invoice PDF (authenticated users)
router.get('/invoices/:id/pdf', auth, generateInvoicePdf);

export default router;
