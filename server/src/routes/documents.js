import express from 'express';
import {
  uploadDocument,
  getDocumentsByOrder,
  downloadDocument,
} from '../controllers/documentController.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', auth, upload.single('file'), uploadDocument);
router.get('/order/:orderId', auth, getDocumentsByOrder);
router.get('/:id/download', auth, downloadDocument);

// Admin-only route to update document status
router.put('/:id/status', auth, authorize('Admin'), updateDocumentStatus);

export default router;
