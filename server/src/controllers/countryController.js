import { Country } from '../models/index.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const countryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage(
      'Country name is required and must be less than 100 characters'
    ),
  body('code')
    .isLength({ min: 2, max: 3 })
    .withMessage('Country code must be 2-3 characters'),
  body('taxRate')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tax rate must be between 0 and 100'),
  body('taxName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Tax name is required'),
  body('currency')
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be 3 characters'),
];

const getAllCountries = async (req, res) => {
  try {
    const { is_active } = req.query;

    const whereClause = {};
    if (is_active !== undefined) {
      whereClause.is_active = is_active === 'true';
    }

    const countries = await Country.findAll({
      where: whereClause,
      order: [['name', 'ASC']],
    });

    res.json({
      countries,
      total: countries.length,
    });
  } catch (error) {
    logger.error('Get countries error:', error);
    res.status(500).json({
      error: 'Failed to retrieve countries',
    });
  }
};

const getCountryById = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByPk(id);

    if (!country) {
      return res.status(404).json({
        error: 'Country not found',
      });
    }

    res.json({ country });
  } catch (error) {
    logger.error('Get country by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve country',
    });
  }
};

const createCountry = async (req, res) => {
  try {
    const {
      name,
      code,
      tax_rate,
      tax_name,
      currency,
      timezone,
      compliance_requirements,
      regulatory_bodies,
      is_active,
    } = req.body;

    const country = await Country.create({
      name,
      code: code.toUpperCase(),
      tax_rate: tax_rate,
      tax_name: tax_name,
      currency: currency.toUpperCase(),
      timezone,
      compliance_requirements: compliance_requirements || {},
      regulatory_bodies: regulatory_bodies || [],
      is_active: is_active !== undefined ? is_active : true,
    });

    logger.info(`New country created: ${country.name} by user ${req.user.id}`);

    res.status(201).json({
      message: 'Country created successfully',
      country: country.toJSON(),
    });
  } catch (error) {
    logger.error('Create country error:', error);
    res.status(500).json({
      error: 'Failed to create country',
    });
  }
};

const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      tax_rate,
      tax_name,
      currency,
      timezone,
      compliance_requirements,
      regulatory_bodies,
      is_active,
    } = req.body;

    const country = await Country.findByPk(id);

    if (!country) {
      return res.status(404).json({
        error: 'Country not found',
      });
    }

    await country.update({
      name: name || country.name,
      code: code ? code.toUpperCase() : country.code,
      tax_rate: tax_rate !== undefined ? tax_rate : country.tax_rate,
      tax_name: tax_name || country.tax_name,
      currency: currency ? currency.toUpperCase() : country.currency,
      timezone: timezone || country.timezone,
      compliance_requirements:
        compliance_requirements || country.compliance_requirements,
      regulatory_bodies: regulatory_bodies || country.regulatory_bodies,
      is_active: is_active !== undefined ? is_active : country.is_active,
    });

    logger.info(`Country updated: ${country.name} by user ${req.user.id}`);

    res.json({
      message: 'Country updated successfully',
      country: country.toJSON(),
    });
  } catch (error) {
    logger.error('Update country error:', error);
    res.status(500).json({
      error: 'Failed to update country',
    });
  }
};

const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findByPk(id);

    if (!country) {
      return res.status(404).json({
        error: 'Country not found',
      });
    }

    // Soft delete - mark as inactive
    await country.update({ is_active: false });

    logger.info(`Country deactivated: ${country.name} by user ${req.user.id}`);

    res.json({
      message: 'Country deactivated successfully',
    });
  } catch (error) {
    logger.error('Delete country error:', error);
    res.status(500).json({
      error: 'Failed to delete country',
    });
  }
};

export {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  countryValidation,
  handleValidationErrors,
};
