import { Industry } from '../models/index.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const industryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Industry name is required and must be less than 100 characters'
    ),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
];

const getAllIndustries = async (req, res) => {
  try {
    const { is_active } = req.query;

    const whereClause = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const industries = await Industry.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    res.json({
      industries,
      total: industries.length,
    });
  } catch (error) {
    logger.error('Get industries error:', error);
    res.status(500).json({
      error: 'Failed to retrieve industries',
    });
  }
};

const getIndustryById = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findByPk(id);

    if (!industry) {
      return res.status(404).json({
        error: 'Industry not found',
      });
    }

    res.json({ industry });
  } catch (error) {
    logger.error('Get industry by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve industry',
    });
  }
};

const createIndustry = async (req, res) => {
  try {
    const {
      name,
      description,
      specific_requirements,
      questionnaire_fields,
      compliance_requirements,
      is_active,
    } = req.body;

    const industry = await Industry.create({
      name,
      description,
      specific_requirements: specific_requirements || {},
      questionnaire_fields: questionnaire_fields || [],
      compliance_requirements: compliance_requirements || [],
      is_active: is_active !== undefined ? is_active : true,
    });

    logger.info(
      `New industry created: ${industry.name} by user ${req.user.id}`
    );

    res.status(201).json({
      message: 'Industry created successfully',
      industry: industry.toJSON(),
    });
  } catch (error) {
    logger.error('Create industry error:', error);
    res.status(500).json({
      error: 'Failed to create industry',
    });
  }
};

const updateIndustry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      specific_requirements,
      questionnaire_fields,
      compliance_requirements,
      is_active,
    } = req.body;

    const industry = await Industry.findByPk(id);

    if (!industry) {
      return res.status(404).json({
        error: 'Industry not found',
      });
    }

    await industry.update({
      name: name || industry.name,
      description:
        description !== undefined ? description : industry.description,
      specific_requirements:
        specific_requirements || industry.specific_requirements,
      questionnaire_fields:
        questionnaire_fields || industry.questionnaire_fields,
      compliance_requirements:
        compliance_requirements || industry.compliance_requirements,
      is_active: is_active !== undefined ? is_active : industry.is_active,
    });

    logger.info(`Industry updated: ${industry.name} by user ${req.user.id}`);

    res.json({
      message: 'Industry updated successfully',
      industry: industry.toJSON(),
    });
  } catch (error) {
    logger.error('Update industry error:', error);
    res.status(500).json({
      error: 'Failed to update industry',
    });
  }
};

const deleteIndustry = async (req, res) => {
  try {
    const { id } = req.params;

    const industry = await Industry.findByPk(id);

    if (!industry) {
      return res.status(404).json({
        error: 'Industry not found',
      });
    }

    // Soft delete - mark as inactive
    await industry.update({ is_active: false });

    logger.info(
      `Industry deactivated: ${industry.name} by user ${req.user.id}`
    );

    res.json({
      message: 'Industry deactivated successfully',
    });
  } catch (error) {
    logger.error('Delete industry error:', error);
    res.status(500).json({
      error: 'Failed to delete industry',
    });
  }
};

export {
  getAllIndustries,
  getIndustryById,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  industryValidation,
  handleValidationErrors,
};
