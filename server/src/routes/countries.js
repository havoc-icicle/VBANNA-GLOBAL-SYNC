import express from 'express';
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  countryValidation,
  handleValidationErrors
} from '../controllers/countryController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCountries);
router.get('/:id', getCountryById);

// Protected routes (Admin only)
router.post('/', auth, authorize('Admin'), countryValidation, handleValidationErrors, createCountry);
router.put('/:id', auth, authorize('Admin'), updateCountry);
router.delete('/:id', auth, authorize('Admin'), deleteCountry);

export default router;