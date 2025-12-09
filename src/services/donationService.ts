import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { momoService } from './momoService';
import { CreateDonationRequest, DonationStatus } from '../types';
import { logger } from '../utils/logger';
import { Donation, Prisma } from '@prisma/client';

/**
 * Donation Service
 * Handles all business logic related to donations
 */

interface DonationResult {
  donation: Donation;
  paymentInitiated: boolean;
  error?: string;
}

/**
 * Create a new donation and initiate payment
 */
export async function createDonation(
  data: CreateDonationRequest
): Promise<DonationResult> {
  const externalId = uuidv4();

  logger.info('Creating donation:', {
    causeId: data.causeId,
    amount: data.amount,
    currency: data.currency,
    externalId,
  });

  // Create donation record with pending status
  const donation = await prisma.donation.create({
    data: {
      causeId: data.causeId,
      donorPhone: data.donorPhone,
      amount: new Prisma.Decimal(data.amount.toString()),
      currency: data.currency.toUpperCase(),
      status: 'pending',
      externalId,
      payerMessage: data.payerMessage,
    },
  });

  // Initiate MoMo RequestToPay
  const paymentResult = await momoService.requestToPay({
    amount: data.amount.toString(),
    currency: data.currency.toUpperCase(),
    externalId,
    payer: {
      partyIdType: 'MSISDN',
      partyId: data.donorPhone,
    },
    payerMessage: data.payerMessage,
  });

  // Update donation with MoMo reference
  if (paymentResult.success && paymentResult.referenceId) {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { momoRefId: paymentResult.referenceId },
    });
    
    donation.momoRefId = paymentResult.referenceId;
  }

  return {
    donation,
    paymentInitiated: paymentResult.success,
    error: paymentResult.error,
  };
}

/**
 * Get donation by ID
 */
export async function getDonationById(id: string): Promise<Donation | null> {
  return prisma.donation.findUnique({
    where: { id },
    include: { cause: true },
  });
}

/**
 * Get donation by external ID
 */
export async function getDonationByExternalId(
  externalId: string
): Promise<Donation | null> {
  return prisma.donation.findUnique({
    where: { externalId },
  });
}

/**
 * Get all donations for a cause
 */
export async function getDonationsByCause(causeId: string): Promise<Donation[]> {
  return prisma.donation.findMany({
    where: { causeId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all donations by donor phone
 */
export async function getDonationsByDonor(donorPhone: string): Promise<Donation[]> {
  return prisma.donation.findMany({
    where: { donorPhone },
    orderBy: { createdAt: 'desc' },
    include: { cause: true },
  });
}

/**
 * Update donation status
 */
export async function updateDonationStatus(
  id: string,
  status: DonationStatus,
  momoRefId?: string
): Promise<Donation | null> {
  return prisma.donation.update({
    where: { id },
    data: {
      status,
      ...(momoRefId && { momoRefId }),
    },
  });
}

/**
 * Check and update donation status from MoMo
 */
export async function syncDonationStatus(donationId: string): Promise<Donation | null> {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
  });

  if (!donation || !donation.momoRefId) {
    logger.warn('Cannot sync status: donation not found or no MoMo reference');
    return donation;
  }

  // Only check pending donations
  if (donation.status !== 'pending') {
    return donation;
  }

  const statusResult = await momoService.getRequestToPayStatus(donation.momoRefId);

  if (statusResult.status !== donation.status) {
    const updated = await prisma.donation.update({
      where: { id: donationId },
      data: { status: statusResult.status },
    });

    logger.info('Donation status updated:', {
      id: donationId,
      oldStatus: donation.status,
      newStatus: statusResult.status,
    });

    return updated;
  }

  return donation;
}

/**
 * Get total successful donations for a cause
 */
export async function getTotalDonationsByCause(
  causeId: string
): Promise<{ total: number; currency: string }> {
  const result = await prisma.donation.aggregate({
    where: {
      causeId,
      status: 'success',
    },
    _sum: {
      amount: true,
    },
  });

  // Get the currency from the first donation (assuming same currency for all)
  const firstDonation = await prisma.donation.findFirst({
    where: { causeId },
    select: { currency: true },
  });

  return {
    total: result._sum.amount?.toNumber() || 0,
    currency: firstDonation?.currency || 'EUR',
  };
}

