import express from 'express';
import {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  industryValidation,
  handleValidationErrors
} from '../controllers/industryController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllIndustries);
router.get('/:id', getIndustryById);

// Protected routes (Admin only)
router.post('/', auth, authorize('Admin'), industryValidation, handleValidationErrors, createIndustry);
router.put('/:id', auth, authorize('Admin'), updateIndustry);
router.delete('/:id', auth, authorize('Admin'), deleteIndustry);

export default router;