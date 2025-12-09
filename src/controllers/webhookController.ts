import { Request, Response } from 'express';
import { donationService, payoutService } from '../services';
import { ApiResponse, MoMoWebhookCallback } from '../types';
import { asyncHandler, BadRequestError } from '../middleware';
import { logger } from '../utils/logger';

/**
 * Webhook Controller
 * Handles webhook callbacks from MoMo API
 */

/**
 * Handle collection (RequestToPay) webhook callback
 * POST /webhooks/momo/collection
 */
export const handleCollectionWebhook = asyncHandler(async (req: Request, res: Response) => {
  const callback: MoMoWebhookCallback = req.body;

  logger.info('Collection webhook received:', callback);

  // Validate callback payload
  if (!callback.referenceId || !callback.status) {
    throw new BadRequestError('Invalid webhook payload: missing referenceId or status');
  }

  // Find donation by MoMo reference ID
  const donation = await donationService.getDonationByMomoRefId(callback.referenceId);

  if (!donation) {
    logger.warn('Donation not found for webhook:', { referenceId: callback.referenceId });
    // Return 200 to acknowledge receipt (don't retry)
    res.json({
      success: true,
      message: 'Webhook received but donation not found',
    });
    return;
  }

  // Map MoMo status to our internal status
  let newStatus: 'pending' | 'success' | 'failed' = 'pending';
  if (callback.status === 'SUCCESSFUL') {
    newStatus = 'success';
  } else if (callback.status === 'FAILED') {
    newStatus = 'failed';
  }

  // Update donation status
  await donationService.updateDonationStatus(
    donation.id,
    newStatus,
    callback.referenceId
  );

  logger.info('Donation status updated via webhook:', {
    donationId: donation.id,
    status: newStatus,
    referenceId: callback.referenceId,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Webhook processed successfully',
  };

  // Always return 200 to acknowledge receipt
  res.json(response);
});

/**
 * Handle disbursement (Transfer) webhook callback
 * POST /webhooks/momo/disbursement
 */
export const handleDisbursementWebhook = asyncHandler(async (req: Request, res: Response) => {
  const callback: MoMoWebhookCallback = req.body;

  logger.info('Disbursement webhook received:', callback);

  // Validate callback payload
  if (!callback.referenceId || !callback.status) {
    throw new BadRequestError('Invalid webhook payload: missing referenceId or status');
  }

  // Find payout by MoMo reference ID
  const payout = await payoutService.getPayoutByMomoRefId(callback.referenceId);

  if (!payout) {
    logger.warn('Payout not found for webhook:', { referenceId: callback.referenceId });
    // Return 200 to acknowledge receipt (don't retry)
    res.json({
      success: true,
      message: 'Webhook received but payout not found',
    });
    return;
  }

  // Map MoMo status to our internal status
  let newStatus: 'pending' | 'completed' | 'failed' = 'pending';
  if (callback.status === 'SUCCESSFUL') {
    newStatus = 'completed';
  } else if (callback.status === 'FAILED') {
    newStatus = 'failed';
  }

  // Update payout status
  await payoutService.updatePayoutStatus(
    payout.id,
    newStatus,
    callback.referenceId
  );

  logger.info('Payout status updated via webhook:', {
    payoutId: payout.id,
    status: newStatus,
    referenceId: callback.referenceId,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Webhook processed successfully',
  };

  // Always return 200 to acknowledge receipt
  res.json(response);
});

