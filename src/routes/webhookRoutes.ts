import { Router } from 'express';
import { webhookController } from '../controllers';

/**
 * Webhook Routes
 * /webhooks
 * 
 * Note: Webhook endpoints should NOT require authentication
 * as they are called by MoMo API servers.
 * The main app already handles JSON parsing, so we don't need to add it here.
 */

const router = Router();

// POST /webhooks/momo/collection - Handle collection (RequestToPay) callbacks
router.post('/momo/collection', webhookController.handleCollectionWebhook);

// POST /webhooks/momo/disbursement - Handle disbursement (Transfer) callbacks
router.post('/momo/disbursement', webhookController.handleDisbursementWebhook);

export default router;

