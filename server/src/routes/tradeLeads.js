import express from 'express';
import {
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
} from '../controllers/tradeLeadController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public/User routes (authenticated)
router.get('/', auth, getAllTradeLeads);
router.get('/:id', auth, getTradeLeadById);
router.post('/:id/refine', auth, requestRefinement); // User can request refinement
router.get('/hsn/:code', auth, getTradeLeadsByHsnCode); // Get leads by HSN code

// Admin/Mid-Broker routes (authenticated and authorized)
router.post('/', auth, authorize('Admin', 'Mid-Broker'), tradeLeadValidation, handleValidationErrors, createTradeLead);
router.put('/:id', auth, authorize('Admin', 'Mid-Broker'), updateTradeLead);
router.delete('/:id', auth, authorize('Admin'), deleteTradeLead); // Admin can delete
router.put('/:id/status', auth, authorize('Admin'), updateTradeLeadStatus); // Admin can update status

export default router;
