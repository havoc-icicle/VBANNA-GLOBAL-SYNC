import express from 'express';
import {
  getActiveQuestionnaire,
  submitResponse,
  skipQuestionnaire,
  saveProgress,
  getProgress,
  responseValidation,
  handleValidationErrors
} from '../controllers/questionnaireController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get active questionnaire for onboarding
router.get('/active', auth, getActiveQuestionnaire);

// Submit questionnaire response
router.post('/responses', auth, responseValidation, handleValidationErrors, submitResponse);

// Skip questionnaire
router.post('/skip', auth, skipQuestionnaire);

// Save progress (draft)
router.post('/progress', auth, saveProgress);

// New endpoint for questionnaire response file uploads
router.post('/upload-response-file', auth, upload.single('file'), uploadResponseFile);

// Get saved progress
router.get('/:questionnaireId/progress', auth, getProgress);

export default router;