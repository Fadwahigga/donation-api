import { Request, Response } from 'express';
import { payoutService, causeService } from '../services';
import { ApiResponse, CreatePayoutRequest } from '../types';
import { NotFoundError, BadRequestError, asyncHandler } from '../middleware';

/**
 * Payout Controller
 * Handles HTTP requests for payout/disbursement operations
 */

/**
 * Create a new payout (initiate transfer)
 * POST /payout
 */
export const createPayout = asyncHandler(async (req: Request, res: Response) => {
  const data: CreatePayoutRequest = req.body;
  const amount = typeof data.amount === 'string' 
    ? parseFloat(data.amount) 
    : data.amount;
  
  // Validate payout (check cause exists and has sufficient balance)
  const validation = await payoutService.validatePayout(data.causeId, amount);
  
  if (!validation.valid) {
    throw new BadRequestError(validation.error || 'Invalid payout request');
  }

  const result = await payoutService.createPayout(data);

  const response: ApiResponse = {
    success: true,
    data: {
      payoutId: result.payout.id,
      externalId: result.payout.externalId,
      status: result.payout.status,
      momoRefId: result.payout.momoRefId,
      transferInitiated: result.transferInitiated,
      amount: result.payout.amount.toString(),
      currency: result.payout.currency,
      availableBalanceAfter: validation.availableBalance - amount,
      ...(result.error && { transferError: result.error }),
    },
    message: result.transferInitiated 
      ? 'Payout created and transfer initiated.'
      : 'Payout created but transfer failed. Please try again.',
  };

  res.status(201).json(response);
});

/**
 * Get all payouts for a cause
 * GET /payouts/:causeId
 */
export const getPayoutsByCause = asyncHandler(async (req: Request, res: Response) => {
  const { causeId } = req.params;
  
  // Verify cause exists
  const cause = await causeService.getCauseById(causeId);
  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const payouts = await payoutService.getPayoutsByCause(causeId);

  const formattedPayouts = payouts.map(p => ({
    ...p,
    amount: p.amount.toString(),
  }));

  const response: ApiResponse = {
    success: true,
    data: {
      cause: {
        id: cause.id,
        name: cause.name,
      },
      payouts: formattedPayouts,
      count: payouts.length,
    },
  };

  res.json(response);
});

/**
 * Get payout by ID
 * GET /payouts/detail/:id
 */
export const getPayoutById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const payout = await payoutService.getPayoutById(id);

  if (!payout) {
    throw new NotFoundError('Payout not found');
  }

  const response: ApiResponse = {
    success: true,
    data: {
      ...payout,
      amount: payout.amount.toString(),
    },
  };

  res.json(response);
});

/**
 * Check/sync payout status from MoMo
 * GET /payouts/detail/:id/status
 */
export const checkPayoutStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const payout = await payoutService.syncPayoutStatus(id);

  if (!payout) {
    throw new NotFoundError('Payout not found');
  }

  const response: ApiResponse = {
    success: true,
    data: {
      id: payout.id,
      status: payout.status,
      momoRefId: payout.momoRefId,
      updatedAt: payout.updatedAt,
    },
  };

  res.json(response);
});

/**
 * Get payout summary for a cause
 * GET /payouts/:causeId/summary
 */
export const getPayoutSummary = asyncHandler(async (req: Request, res: Response) => {
  const { causeId } = req.params;
  
  // Verify cause exists
  const cause = await causeService.getCauseById(causeId);
  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const summary = await payoutService.getPayoutSummary(causeId);

  const response: ApiResponse = {
    success: true,
    data: {
      cause: {
        id: cause.id,
        name: cause.name,
        ownerPhone: cause.ownerPhone,
      },
      ...summary,
    },
  };

  res.json(response);
});

