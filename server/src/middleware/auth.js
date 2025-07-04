import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from '../utils/logger.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    logger.info('Token decoded for user:', decoded.id);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      logger.warn('User not found or inactive:', decoded.id);
      return res.status(401).json({ 
        error: 'Invalid token or user inactive.' 
      });
    }

    logger.info('User authenticated successfully:', { id: user.id, role: user.role, email: user.email });
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ 
      error: 'Invalid token.' 
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied. Please authenticate.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }

    next();
  };
};

export { auth, authorize };