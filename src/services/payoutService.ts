import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { momoService } from './momoService';
import { CreatePayoutRequest, PayoutStatus } from '../types';
import { logger } from '../utils/logger';
import { Payout, Prisma } from '@prisma/client';
import * as donationService from './donationService';

/**
 * Payout Service
 * Handles all business logic related to payouts/disbursements
 */

interface PayoutResult {
  payout: Payout;
  transferInitiated: boolean;
  error?: string;
}

interface PayoutValidation {
  valid: boolean;
  availableBalance: number;
  currency: string;
  error?: string;
}

/**
 * Validate payout request
 * Checks if cause exists and has sufficient balance
 */
export async function validatePayout(
  causeId: string,
  amount: number
): Promise<PayoutValidation> {
  // Get cause
  const cause = await prisma.cause.findUnique({
    where: { id: causeId },
  });

  if (!cause) {
    return {
      valid: false,
      availableBalance: 0,
      currency: '',
      error: 'Cause not found',
    };
  }

  // Get total successful donations
  const totalDonations = await donationService.getTotalDonationsByCause(causeId);

  // Get total completed payouts
  const totalPayouts = await prisma.payout.aggregate({
    where: {
      causeId,
      status: 'completed',
    },
    _sum: {
      amount: true,
    },
  });

  const payoutsTotal = totalPayouts._sum.amount?.toNumber() || 0;
  const availableBalance = totalDonations.total - payoutsTotal;

  if (amount > availableBalance) {
    return {
      valid: false,
      availableBalance,
      currency: totalDonations.currency,
      error: `Insufficient balance. Available: ${availableBalance} ${totalDonations.currency}`,
    };
  }

  return {
    valid: true,
    availableBalance,
    currency: totalDonations.currency,
  };
}

/**
 * Create a new payout and initiate transfer
 */
export async function createPayout(
  data: CreatePayoutRequest
): Promise<PayoutResult> {
  const externalId = uuidv4();

  // Get cause for owner phone
  const cause = await prisma.cause.findUnique({
    where: { id: data.causeId },
  });

  if (!cause) {
    throw new Error('Cause not found');
  }

  logger.info('Creating payout:', {
    causeId: data.causeId,
    amount: data.amount,
    currency: data.currency,
    externalId,
  });

  // Create payout record with pending status
  const payout = await prisma.payout.create({
    data: {
      causeId: data.causeId,
      amount: new Prisma.Decimal(data.amount.toString()),
      currency: data.currency.toUpperCase(),
      status: 'pending',
      externalId,
    },
  });

  // Initiate MoMo Transfer
  const transferResult = await momoService.transfer({
    amount: data.amount.toString(),
    currency: data.currency.toUpperCase(),
    externalId,
    payee: {
      partyIdType: 'MSISDN',
      partyId: cause.ownerPhone,
    },
    payerMessage: `Payout for cause: ${cause.name}`,
    payeeNote: `Funds disbursement from donations`,
  });

  // Update payout with MoMo reference
  if (transferResult.success && transferResult.referenceId) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { momoRefId: transferResult.referenceId },
    });

    payout.momoRefId = transferResult.referenceId;
  }

  return {
    payout,
    transferInitiated: transferResult.success,
    error: transferResult.error,
  };
}

/**
 * Get payout by ID
 */
export async function getPayoutById(id: string): Promise<Payout | null> {
  return prisma.payout.findUnique({
    where: { id },
    include: { cause: true },
  });
}

/**
 * Get payout by MoMo reference ID
 */
export async function getPayoutByMomoRefId(
  momoRefId: string
): Promise<Payout | null> {
  return prisma.payout.findFirst({
    where: { momoRefId },
  });
}

/**
 * Get all payouts for a cause
 */
export async function getPayoutsByCause(causeId: string): Promise<Payout[]> {
  return prisma.payout.findMany({
    where: { causeId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  id: string,
  status: PayoutStatus,
  momoRefId?: string
): Promise<Payout | null> {
  return prisma.payout.update({
    where: { id },
    data: {
      status,
      ...(momoRefId && { momoRefId }),
    },
  });
}

/**
 * Check and update payout status from MoMo
 */
export async function syncPayoutStatus(payoutId: string): Promise<Payout | null> {
  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  });

  if (!payout || !payout.momoRefId) {
    logger.warn('Cannot sync status: payout not found or no MoMo reference');
    return payout;
  }

  // Only check pending payouts
  if (payout.status !== 'pending') {
    return payout;
  }

  const statusResult = await momoService.getTransferStatus(payout.momoRefId);

  if (statusResult.status !== payout.status) {
    const updated = await prisma.payout.update({
      where: { id: payoutId },
      data: { status: statusResult.status },
    });

    logger.info('Payout status updated:', {
      id: payoutId,
      oldStatus: payout.status,
      newStatus: statusResult.status,
    });

    return updated;
  }

  return payout;
}

/**
 * Get payout summary for a cause
 */
export async function getPayoutSummary(causeId: string): Promise<{
  totalDonations: number;
  totalPayouts: number;
  availableBalance: number;
  currency: string;
}> {
  const totalDonations = await donationService.getTotalDonationsByCause(causeId);

  const totalPayoutsResult = await prisma.payout.aggregate({
    where: {
      causeId,
      status: 'completed',
    },
    _sum: {
      amount: true,
    },
  });

  const totalPayouts = totalPayoutsResult._sum.amount?.toNumber() || 0;

  return {
    totalDonations: totalDonations.total,
    totalPayouts,
    availableBalance: totalDonations.total - totalPayouts,
    currency: totalDonations.currency,
  };
}

