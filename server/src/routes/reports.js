import express from 'express';
import {
  generateReport,
  getReports,
  getReportById,
  downloadReport,
} from '../controllers/reportController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Authenticated routes for all users
router.get('/', auth, getReports);
router.get('/:id', auth, getReportById);
router.get('/:id/download', auth, downloadReport);

// Admin-only routes
router.post('/generate', auth, authorize('Admin'), generateReport);

export default router;
