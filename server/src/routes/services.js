import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  serviceValidation,
  handleValidationErrors
} from '../controllers/serviceController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/category/:category', getServicesByCategory);
router.get('/:id', getServiceById);

// Protected routes (Admin only)
router.post('/', auth, authorize('Admin'), serviceValidation, handleValidationErrors, createService);
router.put('/:id', auth, authorize('Admin'), updateService);
router.delete('/:id', auth, authorize('Admin'), deleteService);

export default router;