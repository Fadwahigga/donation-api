import { Router } from 'express';
import { payoutController } from '../controllers';
import { validatePayoutRequest, validateUUIDParam } from '../middleware';

/**
 * Payout Routes
 */

const router = Router();

// POST /payout - Create a new payout (initiate transfer)
router.post('/payout', validatePayoutRequest, payoutController.createPayout);

// GET /payouts/:causeId - Get all payouts for a cause
router.get(
  '/payouts/:causeId', 
  validateUUIDParam('causeId'), 
  payoutController.getPayoutsByCause
);

// GET /payouts/:causeId/summary - Get payout summary for a cause
router.get(
  '/payouts/:causeId/summary', 
  validateUUIDParam('causeId'), 
  payoutController.getPayoutSummary
);

// GET /payouts/detail/:id - Get payout by ID
router.get(
  '/payouts/detail/:id', 
  validateUUIDParam('id'), 
  payoutController.getPayoutById
);

// GET /payouts/detail/:id/status - Check/sync payout status
router.get(
  '/payouts/detail/:id/status', 
  validateUUIDParam('id'), 
  payoutController.checkPayoutStatus
);

export default router;

