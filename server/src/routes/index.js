import express from 'express';
import authRoutes from './auth.js';
import serviceRoutes from './services.js';
import orderRoutes from './orders.js';
import countryRoutes from './countries.js';
import industryRoutes from './industries.js';
import questionnaireRoutes from './questionnaires.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route mounting
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/orders', orderRoutes);
router.use('/countries', countryRoutes);
router.use('/industries', industryRoutes);
router.use('/questionnaires', questionnaireRoutes);

export default router;