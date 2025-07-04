import { Order, Service, User, Payment, Invoice } from '../models/index.js';
import { calculatePricing } from '../utils/pricing.js';
import { generateOrderNumber } from '../utils/orderUtils.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const orderValidation = [
  body('serviceId').isUUID().withMessage('Valid service ID is required'),
  body('priority')
    .isIn(['standard', 'rush'])
    .withMessage('Priority must be standard or rush'),
  body('requirements')
    .optional()
    .isObject()
    .withMessage('Requirements must be an object'),
];

const createOrder = async (req, res) => {
  try {
    const {
      service_id,
      priority = 'standard',
      requirements = {},
      is_partial_payment_allowed = false,
      payment_schedule = [],
    } = req.body;

    const user_id = req.user.id;

    // Validate service exists
    const service = await Service.findByPk(service_id);
    if (!service || !service.is_active) {
      return res.status(404).json({
        error: 'Service not found or inactive',
      });
    }

    // Check if rush delivery is available
    if (priority === 'rush' && !service.rush_turnaround_days) {
      return res.status(400).json({
        error: 'Rush delivery not available for this service',
      });
    }

    // Count user's existing orders for volume discount calculation
    const user_order_count = await Order.count({
      where: { user_id },
      include: [
        {
          model: Payment,
          as: 'payments',
          where: { status: 'succeeded' },
          required: true,
        },
      ],
    });

    // Calculate pricing
    const pricing = calculatePricing({
      service,
      priority,
      is_volume_discount: user_order_count > 0,
      country: req.user.country || 'Singapore',
    });

    // Generate order number
    const order_number = generateOrderNumber();

    // Calculate expected completion date
    const turnaround_days =
      priority === 'rush'
        ? service.rush_turnaround_days
        : service.standard_turnaround_days;
    const expected_completion_date = new Date();
    expected_completion_date.setDate(
      expected_completion_date.getDate() + turnaround_days
    );

    // Create order
    const order = await Order.create({
      order_number,
      user_id,
      service_id,
      priority,
      base_price: pricing.basePrice,
      discount: pricing.discount,
      surcharge: pricing.surcharge,
      tax_amount: pricing.taxAmount,
      total_price: pricing.totalPrice,
      currency: pricing.currency,
      expected_completion_date,
      max_revisions: service.revisionPolicy,
      requirements,
      is_partial_payment_allowed,
      payment_schedule: is_partial_payment_allowed ? payment_schedule : [],
    });

    // Create invoice
    const invoice = await Invoice.create({
      invoice_number: `INV-${order_number}`,
      order_id: order.id,
      base_amount: pricing.basePrice,
      discount_amount: pricing.discount,
      surcharge_amount: pricing.surcharge,
      tax_amount: pricing.taxAmount,
      total_amount: pricing.totalPrice,
      currency: pricing.currency,
      status: 'draft',
      line_items: [
        {
          description: service.name,
          quantity: 1,
          unit_rice: pricing.base_price,
          total: pricing.base_price,
        },
      ],
      billing_address: {
        name: `${req.user.first_name} ${req.user.last_name}`,
        email: req.user.email,
        country: req.user.country,
      },
    });

    logger.info(`Order created: ${order.order_number} by user ${user_id}`);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        ...order.toJSON(),
        service: service.toJSON(),
        invoice: invoice.toJSON(),
      },
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const user_id = req.user.id;

    // Build filters object for the Order model
    const filters = {
      user_id, // Always filter by current user for getUserOrders
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (search) {
      filters.search = search;
    }

    logger.info('Getting user orders with filters:', filters);
    
    const result = await Order.findAndCountAll(filters);

    logger.info(`Found ${result.count} orders for user ${user_id}`);

    res.json({
      orders: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get user orders error:', error);
    res.status(500).json({
      error: 'Failed to retrieve orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const whereClause = { id };

    // Non-admin users can only see their own orders
    if (user_role !== 'Admin') {
      whereClause.userId = user_id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: Service,
          as: 'service',
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Payment,
          as: 'payments',
        },
        {
          model: Invoice,
          as: 'invoice',
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    res.json({ order });
  } catch (error) {
    logger.error('Get order by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve order',
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = [
      'pending',
      'in_progress',
      'completed',
      'revised',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    const update_data = { status };

    if (notes) {
      update_data.notes = notes;
    }

    if (status === 'in_progress' && !order.start_date) {
      update_data.start_date = new Date();
    }

    if (status === 'completed') {
      update_data.actual_completion_date = new Date();
    }

    await order.update(update_data);

    logger.info(
      `Order status updated: ${order.order_number} to ${status} by user ${req.user.id}`
    );

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      error: 'Failed to update order status',
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10, search } = req.query;

    // Build filters object for the Order model
    const filters = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    if (status) {
      filters.status = status;
    }

    if (priority) {
      filters.priority = priority;
    }

    if (search) {
      filters.search = search;
    }

    logger.info('Getting all orders with filters:', filters);
    
    const result = await Order.findAndCountAll(filters);

    logger.info(`Found ${result.count} total orders`);

    res.json({
      orders: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all orders error:', error);
    res.status(500).json({
      error: 'Failed to retrieve orders',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const requestRevision = async (req, res) => {
  try {
    const { id } = req.params;
    const { revision_notes } = req.body;

    const order = await Order.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        error: 'Can only request revision for completed orders',
      });
    }

    if (order.revision_count >= order.max_revisions) {
      return res.status(400).json({
        error: 'Maximum revisions exceeded',
      });
    }

    await order.update({
      status: 'revised',
      revision_count: order.revisionCount + 1,
      notes: revision_notes || order.notes,
    });

    logger.info(
      `Revision requested for order: ${order.orderNumber} by user ${req.user.id}`
    );

    res.json({
      message: 'Revision requested successfully',
      order,
    });
  } catch (error) {
    logger.error('Request revision error:', error);
    res.status(500).json({
      error: 'Failed to request revision',
    });
  }
};

export {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  requestRevision,
  orderValidation,
  handleValidationErrors,
};
