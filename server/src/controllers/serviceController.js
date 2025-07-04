import { Service, Country, Industry } from '../models/index.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const serviceValidation = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage(
      'Service name is required and must be less than 255 characters'
    ),
  body('category')
    .isIn(['Documentation', 'Digital'])
    .withMessage('Category must be Documentation or Digital'),
  body('priceMin')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('priceMax')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  body('standardTurnaroundDays')
    .isInt({ min: 1 })
    .withMessage('Standard turnaround days must be a positive integer'),
];

const getAllServices = async (req, res) => {
  try {
    const { category, is_active } = req.query;

    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const services = await Service.findAll({
      where: whereClause,
      order: [
        ['category', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    res.json({
      services,
      total: services.length,
    });
  } catch (error) {
    logger.error('Get services error:', error);
    res.status(500).json({
      error: 'Failed to retrieve services',
    });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
      });
    }

    res.json({ service });
  } catch (error) {
    logger.error('Get service by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve service',
    });
  }
};

const createService = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      deliverables,
      revision_policy,
      standard_turnaround_days,
      rush_turnaround_days,
      price_min,
      price_max,
      currency,
      rush_surcharge_percent,
      features,
      additional_notes,
    } = req.body;

    // Validate price range
    if (price_max < price_min) {
      return res.status(400).json({
        error: 'Maximum price must be greater than or equal to minimum price',
      });
    }

    const service = await Service.create({
      name,
      category,
      description,
      deliverables: deliverables || [],
      revision_policy: revision_policy || 1,
      standard_turnaround_days,
      rush_turnaround_days,
      price_min,
      price_max,
      currency: currency || 'SGD',
      rush_surcharge_percent,
      features: features || [],
      additional_notes,
    });

    logger.info(`New service created: ${service.name} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error) {
    logger.error('Create service error:', error);
    res.status(500).json({
      error: 'Failed to create service',
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      description,
      deliverables,
      revision_policy,
      standard_turnaround_days,
      rush_turnaround_days,
      price_min,
      price_max,
      currency,
      rush_surcharge_percent,
      features,
      additional_notes,
      is_active,
    } = req.body;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
      });
    }

    // Validate price range if provided
    const new_price_min =
      price_min !== undefined ? price_min : service.price_min;
    const new_price_max =
      price_max !== undefined ? price_max : service.price_max;

    if (new_price_max < new_price_min) {
      return res.status(400).json({
        error: 'Maximum price must be greater than or equal to minimum price',
      });
    }

    await service.update({
      name: name || service.name,
      category: category || service.category,
      description: description || service.description,
      deliverables: deliverables || service.deliverables,
      revision_policy:
        revision_policy !== undefined
          ? revision_policy
          : service.revision_policy,
      standard_turnaround_days:
        standard_turnaround_days || service.standard_turnaround_days,
      rush_turnaround_days:
        rush_turnaround_days || service.rush_turnaround_days,
      price_min: new_price_min,
      price_max: new_price_max,
      currency: currency || service.currency,
      rush_surcharge_percent:
        rush_surcharge_percent !== undefined
          ? rush_surcharge_percent
          : service.rush_surcharge_percent,
      features: features || service.features,
      additional_notes: additional_notes || service.additional_notes,
      is_active: is_active !== undefined ? is_active : service.is_active,
    });

    logger.info(`Service updated: ${service.name} by user ${req.user.id}`);

    res.json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error) {
    logger.error('Update service error:', error);
    res.status(500).json({
      error: 'Failed to update service',
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
      });
    }

    // Soft delete - just mark as inactive
    await service.update({ isActive: false });

    logger.info(`Service deleted: ${service.name} by user ${req.user.id}`);

    res.json({
      message: 'Service deleted successfully',
    });
  } catch (error) {
    logger.error('Delete service error:', error);
    res.status(500).json({
      error: 'Failed to delete service',
    });
  }
};

const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!['Documentation', 'Digital'].includes(category)) {
      return res.status(400).json({
        error: 'Invalid category. Must be Documentation or Digital',
      });
    }

    const services = await Service.findAll({
      where: {
        category,
        isActive: true,
      },
      order: [['name', 'ASC']],
    });

    res.json({
      category,
      services,
      total: services.length,
    });
  } catch (error) {
    logger.error('Get services by category error:', error);
    res.status(500).json({
      error: 'Failed to retrieve services',
    });
  }
};

export {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByCategory,
  serviceValidation,
  handleValidationErrors,
};
