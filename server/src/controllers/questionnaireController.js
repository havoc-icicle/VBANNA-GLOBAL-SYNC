import { supabase } from '../config/database.js';
import { recommendService } from '../utils/recommendationEngine.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const responseValidation = [
  body('questionnaireId').isUUID().withMessage('Valid questionnaire ID is required'),
  body('answers').isObject().withMessage('Answers must be an object'),
];

const getActiveQuestionnaire = async (req, res) => {
  try {
    logger.info('Fetching active onboarding questionnaire');

    // Get the main business plan questionnaire for onboarding
    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select(`
        *,
        service:services(id, name, category, description)
      `)
      .eq('is_active', true)
      .eq('title', 'Business Plan Consultancy Questionnaire')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'No active questionnaire found'
        });
      }
      throw error;
    }

    logger.info('Active questionnaire retrieved successfully');

    res.json({
      questionnaire: {
        id: questionnaire.id,
        title: questionnaire.title,
        description: questionnaire.description,
        questions: questionnaire.questions,
        conditionalLogic: questionnaire.conditional_logic,
        service: questionnaire.service
      }
    });
  } catch (error) {
    logger.error('Get active questionnaire error:', error);
    res.status(500).json({
      error: 'Failed to retrieve questionnaire'
    });
  }
};

const submitResponse = async (req, res) => {
  try {
    const { questionnaireId, answers, isComplete = true } = req.body;
    const userId = req.user.id;

    logger.info('Submitting questionnaire response:', { userId, questionnaireId, isComplete });

    // Check if questionnaire exists
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .single();

    if (questionnaireError || !questionnaire) {
      return res.status(404).json({
        error: 'Questionnaire not found'
      });
    }

    // Save user response
    const { data: response, error: responseError } = await supabase
      .from('user_responses')
      .insert({
        user_id: userId,
        questionnaire_id: questionnaireId,
        answers: answers,
        is_complete: isComplete,
        submitted_at: isComplete ? new Date().toISOString() : null,
        progress: isComplete ? 100 : Object.keys(answers).length
      })
      .select()
      .single();

    if (responseError) {
      throw responseError;
    }

    // Update user onboarding status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ onboarding_status: 'completed' })
      .eq('id', userId);

    if (userUpdateError) {
      logger.error('Failed to update user onboarding status:', userUpdateError);
    }

    // Get service recommendation based on answers
    let recommendedService = null;
    try {
      recommendedService = await recommendService(answers, questionnaire);
      logger.info('Service recommendation generated:', { recommendedService });
    } catch (recommendationError) {
      logger.error('Service recommendation failed:', recommendationError);
      // Continue without recommendation
    }

    logger.info('Questionnaire response submitted successfully');

    res.json({
      message: 'Response submitted successfully',
      response: {
        id: response.id,
        isComplete: response.is_complete,
        submittedAt: response.submitted_at
      },
      recommendation: recommendedService
    });
  } catch (error) {
    logger.error('Submit response error:', error);
    res.status(500).json({
      error: 'Failed to submit response'
    });
  }
};

const skipQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id;

    logger.info(`[skipQuestionnaire] Received request for user: ${userId}`);
    
    const { data, error: userUpdateError } = await supabase
      .from('users')
      .update({ onboarding_status: 'skipped' })
      .eq('id', userId)
      .select()
      .single();

    if (userUpdateError) {
      logger.error('[skipQuestionnaire] Supabase user update error:', {
        message: userUpdateError.message,
        details: userUpdateError.details,
        hint: userUpdateError.hint,
        code: userUpdateError.code,
      });
      throw userUpdateError;
    }

    logger.info(`[skipQuestionnaire] User onboarding_status updated to 'skipped' for user: ${userId}. Updated user data:`, data);

    res.json({
      message: 'Questionnaire skipped successfully',
      user: data
    });
  } catch (error) {
    logger.error('[skipQuestionnaire] Error:', error);
    res.status(500).json({
      error: process.env.NODE_ENV === 'development'
        ? `Failed to skip questionnaire: ${error.message || error}`
        : 'Failed to skip questionnaire'
    });
  }
};

const saveProgress = async (req, res) => {
  try {
    const { questionnaireId, answers } = req.body;
    const userId = req.user.id;

    logger.info('Saving questionnaire progress:', { userId, questionnaireId });

    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('user_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('questionnaire_id', questionnaireId)
      .eq('is_complete', false)
      .single();

    if (existingResponse) {
      // Update existing response
      const { error } = await supabase
        .from('user_responses')
        .update({
          answers: answers,
          progress: Object.keys(answers).length,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingResponse.id);

      if (error) throw error;
    } else {
      // Create new response
      const { error } = await supabase
        .from('user_responses')
        .insert({
          user_id: userId,
          questionnaire_id: questionnaireId,
          answers: answers,
          is_complete: false,
          progress: Object.keys(answers).length
        });

      if (error) throw error;
    }

    logger.info('Questionnaire progress saved successfully');

    res.json({
      message: 'Progress saved successfully',
      progress: Object.keys(answers).length
    });
  } catch (error) {
    logger.error('Save progress error:', error);
    res.status(500).json({
      error: 'Failed to save progress'
    });
  }
};

const getProgress = async (req, res) => {
  try {
    const { questionnaireId } = req.params;
    const userId = req.user.id;

    logger.info('Getting questionnaire progress:', { userId, questionnaireId });

    const { data: response, error } = await supabase
      .from('user_responses')
      .select('answers, progress, is_complete')
      .eq('user_id', userId)
      .eq('questionnaire_id', questionnaireId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      progress: response ? {
        answers: response.answers,
        progress: response.progress,
        isComplete: response.is_complete
      } : null
    });
  } catch (error) {
    logger.error('Get progress error:', error);
    res.status(500).json({
      error: 'Failed to get progress'
    });
  }
};

export {
  getActiveQuestionnaire,
  submitResponse,
  skipQuestionnaire,
  saveProgress,
  getProgress,
  responseValidation,
  handleValidationErrors
};