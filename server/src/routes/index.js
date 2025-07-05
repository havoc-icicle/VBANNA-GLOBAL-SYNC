import express from 'express';
import authRoutes from './auth.js';
import serviceRoutes from './services.js';
import orderRoutes from './orders.js';
import countryRoutes from './countries.js';
import industryRoutes from './industries.js';
import questionnaireRoutes from './questionnaires.js';
import documentRoutes from './documents.js';
import tradeLeadRoutes from './tradeLeads.js';
import reportRoutes from './reports.js';
import paymentRoutes from './payments.js';

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
router.use('/documents', documentRoutes);
router.use('/trade-leads', tradeLeadRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);

export default router;