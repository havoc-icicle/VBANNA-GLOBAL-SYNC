import { TradeLead, Order, User } from '../models/index.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const tradeLeadValidation = [
  body('orderId').isUUID().withMessage('Valid order ID is required'),
  body('hsnCode').isLength({ min: 6, max: 10 }).withMessage('HSN code must be 6-10 characters'),
  body('productName').notEmpty().withMessage('Product name is required'),
  body('leadType').isIn(['buyer', 'seller']).withMessage('Lead type must be buyer or seller'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('contactPerson').notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('country').notEmpty().withMessage('Country is required'),
];

const getAllTradeLeads = async (req, res) => {
  try {
    const { hsnCode, status, search, page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const filters = {
      page: parseInt(page),
      limit: parseInt(limit),
    };

    if (hsnCode) filters.hsnCode = hsnCode;
    if (status) filters.status = status;
    if (search) filters.search = search; // TODO: Implement search logic in model

    // Non-admins/non-brokers can only see trade leads related to their orders
    if (userRole === 'End User') {
      // Find orders associated with the user
      const userOrders = await Order.findAll({ where: { user_id: userId }, attributes: ['id'] });
      const orderIds = userOrders.map(order => order.id);
      if (orderIds.length === 0) {
        return res.json({ tradeLeads: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } });
      }
      filters.orderId = orderIds; // Filter by order IDs
    }

    logger.info(`Fetching all trade leads with filters: ${JSON.stringify(filters)} by user ${userId} (${userRole})`);

    const result = await TradeLead.findAndCountAll(filters);

    res.json({
      tradeLeads: result.rows,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all trade leads error:', error);
    res.status(500).json({ error: 'Failed to retrieve trade leads.' });
  }
};

const getTradeLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const tradeLead = await TradeLead.findByPk(id);

    if (!tradeLead) {
      return res.status(404).json({ error: 'Trade lead not found.' });
    }

    // Authorization check for End Users
    if (userRole === 'End User') {
      const order = await Order.findByPk(tradeLead.order_id);
      if (!order || order.user_id !== userId) {
        return res.status(403).json({ error: 'Access denied.' });
      }
    }

    res.json({ tradeLead });
  } catch (error) {
    logger.error('Get trade lead by ID error:', error);
    res.status(500).json({ error: 'Failed to retrieve trade lead.' });
  }
};

const createTradeLead = async (req, res) => {
  try {
    const { orderId, hsnCode, productName, leadType, companyName, contactPerson, email, phone, country, address, tradeHistory, complianceStatus, outreachTemplates, priority, maxRefinements } = req.body;
    const userId = req.user.id; // Admin or Mid-Broker creating the lead

    // Validate that the orderId exists and belongs to the current user if not admin
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    // TODO: Add logic to ensure only admins or mid-brokers associated with the order can create trade leads for it.

    const tradeLead = await TradeLead.create({
      order_id: orderId,
      hsn_code: hsnCode,
      product_name: productName,
      lead_type: leadType,
      company_name: companyName,
      contact_person: contactPerson,
      email: email,
      phone: phone,
      country: country,
      address: address,
      trade_history: tradeHistory,
      compliance_status: complianceStatus,
      outreach_templates: outreachTemplates,
      priority: priority,
      max_refinements: maxRefinements || 1, // Default to 1 refinement
      // status and vetted fields default in model
    });

    logger.info(`Trade lead created for order ${orderId} by user ${userId}`);
    res.status(201).json({ message: 'Trade lead created successfully', tradeLead });
  } catch (error) {
    logger.error('Create trade lead error:', error);
    res.status(500).json({ error: 'Failed to create trade lead.' });
  }
};

const updateTradeLead = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    const tradeLead = await TradeLead.findByPk(id);

    if (!tradeLead) {
      return res.status(404).json({ error: 'Trade lead not found.' });
    }

    // Admins can update any field. Mid-brokers might have restricted updates.
    // TODO: Implement granular update permissions for Mid-Brokers.

    await tradeLead.update(updateData);

    logger.info(`Trade lead ${id} updated by user ${userId}`);
    res.json({ message: 'Trade lead updated successfully', tradeLead });
  } catch (error) {
    logger.error('Update trade lead error:', error);
    res.status(500).json({ error: 'Failed to update trade lead.' });
  }
};

const deleteTradeLead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tradeLead = await TradeLead.findByPk(id);

    if (!tradeLead) {
      return res.status(404).json({ error: 'Trade lead not found.' });
    }

    // TODO: Implement soft delete (e.g., set is_active to false) instead of hard delete.
    // For now, this will actually delete the record.
    const { error } = await supabase.from('trade_leads').delete().eq('id', id);

    if (error) throw error;

    logger.info(`Trade lead ${id} deleted by user ${userId}`);
    res.json({ message: 'Trade lead deleted successfully.' });
  } catch (error) {
    logger.error('Delete trade lead error:', error);
    res.status(500).json({ error: 'Failed to delete trade lead.' });
  }
};

const requestRefinement = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const tradeLead = await TradeLead.findByPk(id);

    if (!tradeLead) {
      return res.status(404).json({ error: 'Trade lead not found.' });
    }

    if (tradeLead.refinement_count >= tradeLead.max_refinements) {
      return res.status(400).json({ error: 'Maximum refinements exceeded for this trade lead.' });
    }

    // Increment refinement count and update status
    await tradeLead.update({
      refinement_count: tradeLead.refinement_count + 1,
      status: 'refined', // Set status to refined
      // TODO: Potentially add notes to a refinement history JSONB field
    });

    logger.info(`Refinement requested for trade lead ${id} by user ${userId}. New count: ${tradeLead.refinement_count}`);
    res.json({ message: 'Refinement requested successfully', tradeLead });
  } catch (error) {
    logger.error('Request refinement error:', error);
    res.status(500).json({ error: 'Failed to request refinement.' });
  }
};

const updateTradeLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vettedBy, vettedAt } = req.body;
    const adminId = req.user.id; // Only admins can update status

    if (!['pending', 'approved', 'rejected', 'refined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid trade lead status.' });
    }

    const tradeLead = await TradeLead.findByPk(id);

    if (!tradeLead) {
      return res.status(404).json({ error: 'Trade lead not found.' });
    }

    const updateData = { status };
    if (status === 'approved') {
      updateData.vetted = true;
      updateData.vetted_by = vettedBy || adminId;
      updateData.vetted_at = vettedAt || new Date().toISOString();
    } else if (status === 'rejected') {
      updateData.vetted = false;
      // TODO: Add a rejection reason field to trade_leads table if needed
    }

    await tradeLead.update(updateData);

    logger.info(`Trade lead ${id} status updated to ${status} by admin ${adminId}`);
    res.json({ message: 'Trade lead status updated successfully', tradeLead });
  } catch (error) {
    logger.error('Update trade lead status error:', error);
    res.status(500).json({ error: 'Failed to update trade lead status.' });
  }
};

const getTradeLeadsByHsnCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { status, limit = 10 } = req.query;

    const filters = { hsnCode: code };
    if (status) filters.status = status;

    logger.info(`Fetching trade leads by HSN code: ${code} with filters: ${JSON.stringify(filters)}`);

    const tradeLeads = await TradeLead.findAll({ where: filters, limit: parseInt(limit) });

    res.json({ tradeLeads, total: tradeLeads.length });
  } catch (error) {
    logger.error('Get trade leads by HSN code error:', error);
    res.status(500).json({ error: 'Failed to retrieve trade leads by HSN code.' });
  }
};

export {
  getAllTradeLeads,
  getTradeLeadById,
  createTradeLead,
  updateTradeLead,
  deleteTradeLead,
  requestRefinement,
  updateTradeLeadStatus,
  getTradeLeadsByHsnCode,
  tradeLeadValidation,
  handleValidationErrors,
};
