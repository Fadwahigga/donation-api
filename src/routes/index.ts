import { Router } from 'express';
import authRoutes from './authRoutes';
import causeRoutes from './causeRoutes';
import donationRoutes from './donationRoutes';
import payoutRoutes from './payoutRoutes';
import webhookRoutes from './webhookRoutes';
import { getSupportedCurrencies } from '../middleware/validators';

/**
 * Main router - combines all route modules
 */

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Donation API is running',
    timestamp: new Date().toISOString(),
  });
});

// Get supported currencies endpoint
router.get('/currencies', (_req, res) => {
  res.json({
    success: true,
    data: {
      currencies: getSupportedCurrencies(),
      description: 'Supported MTN Mobile Money currencies',
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/causes', causeRoutes);
router.use('/', donationRoutes);
router.use('/', payoutRoutes);

export default router;

