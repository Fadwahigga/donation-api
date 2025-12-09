import { Router } from 'express';
import causeRoutes from './causeRoutes';
import donationRoutes from './donationRoutes';
import payoutRoutes from './payoutRoutes';

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

// Mount route modules
router.use('/causes', causeRoutes);
router.use('/', donationRoutes);
router.use('/', payoutRoutes);

export default router;

