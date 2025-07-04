import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  requestRevision,
  orderValidation,
  handleValidationErrors
} from '../controllers/orderController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/', auth, orderValidation, handleValidationErrors, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/all', auth, authorize('Admin', 'Mid-Broker'), getAllOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id/status', auth, authorize('Admin'), updateOrderStatus);
router.post('/:id/revision', auth, requestRevision);

export default router;