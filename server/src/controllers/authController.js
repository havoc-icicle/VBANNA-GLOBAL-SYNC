import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.js';

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .isIn(['Admin', 'End User', 'Mid-Broker'])
    .withMessage('Role must be Admin, End User, or Mid-Broker'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );
};

const register = async (req, res) => {
  try {
    logger.info('Registration attempt:', { email: req.body.email, role: req.body.role });

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role = 'End User',
      phone,
      country,
      timezone,
      language,
      referralCode,
      partnerType,
    } = req.body;

    // Check if user already exists
    logger.info('Checking if user exists:', email);
    const existingUser = await User.findOne({
      where: {
        $or: [{ email }, { username }],
      },
    });

    if (existingUser) {
      logger.warn('User already exists:', email);
      return res.status(409).json({
        error: 'User already exists with this email or username',
      });
    }

    // Handle referral code if provided
    let referredByPartnerId = null;
    if (referralCode) {
      logger.info('Processing referral code:', referralCode);
      const referringPartner = await User.findOne({
        where: { referralCode: referralCode },
      });
      if (referringPartner) {
        referredByPartnerId = referringPartner.id;
      }
    }

    // Create new user
    logger.info('Creating new user:', email);
    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      country,
      timezone: timezone || 'UTC',
      language: language || 'en',
      referredByPartnerId,
      partnerType,
      referralCode: role === 'Mid-Broker' ? username + '_' + Date.now() : null,
    });

    // Generate token
    const token = generateToken(user);

    logger.info(`New user registered: ${user.email} (${user.role})`);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    logger.info('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Find user by email
    logger.info('Finding user by email:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn('User not found:', email);
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    if (!user.is_active) {
      logger.warn('User account inactive:', email);
      return res.status(401).json({
        error: 'Account is inactive',
      });
    }

    // Validate password
    logger.info('Validating password for user:', email);
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      logger.warn('Invalid password for user:', email);
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Update last login
    logger.info('Updating last login for user:', email);
    await user.update({ lastLogin: new Date() });

    // Generate token
    const token = generateToken(user);

    logger.info(`User logged in successfully: ${user.email} (${user.role})`);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      phone,
      country,
      timezone,
      language,
      partnerSpecificMetadata,
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({
        where: { username, id: { $ne: user.id } },
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'Username already taken',
        });
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      country: country || user.country,
      timezone: timezone || user.timezone,
      language: language || user.language,
      partnerSpecificMetadata:
        partnerSpecificMetadata || user.partnerSpecificMetadata,
    });

    logger.info(`User profile updated: ${user.email}`);

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Validate current password
    const isValidPassword = await user.validatePassword(currentPassword);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Current password is incorrect',
      });
    }

    // Update password
    await user.update({ password: newPassword });

    logger.info(`Password changed for user: ${user.email}`);

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
    });
  }
};

export {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  registerValidation,
  loginValidation,
  handleValidationErrors,
};