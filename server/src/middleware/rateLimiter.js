import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: message || 'Too many requests from this IP, please try again later.'
      });
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again in 15 minutes.'
);

// More lenient rate limiter for authentication endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // increased from 5 to 10 requests per windowMs
  'Too many authentication attempts, please try again in 15 minutes.'
);

// File upload rate limiter
const uploadLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 uploads per minute
  'Too many file uploads, please try again in a minute.'
);

export { generalLimiter, authLimiter, uploadLimiter };