import { Request, Response } from 'express';
import { donationService, causeService } from '../services';
import { ApiResponse, CreateDonationRequest } from '../types';
import { NotFoundError, BadRequestError, asyncHandler } from '../middleware';

/**
 * Donation Controller
 * Handles HTTP requests for donation-related operations
 */

/**
 * Create a new donation (initiate payment)
 * POST /donate
 */
export const createDonation = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateDonationRequest = req.body;
  
  // Verify cause exists
  const cause = await causeService.getCauseById(data.causeId);
  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const result = await donationService.createDonation(data);

  const response: ApiResponse = {
    success: true,
    data: {
      donationId: result.donation.id,
      externalId: result.donation.externalId,
      status: result.donation.status,
      momoRefId: result.donation.momoRefId,
      paymentInitiated: result.paymentInitiated,
      amount: result.donation.amount.toString(),
      currency: result.donation.currency,
      // Include any error from payment initiation
      ...(result.error && { paymentError: result.error }),
    },
    message: result.paymentInitiated 
      ? 'Donation created and payment request initiated. Waiting for donor confirmation.'
      : 'Donation created but payment request failed. Please try again.',
  };

  res.status(201).json(response);
});

/**
 * Get donation by ID
 * GET /donations/:id
 */
export const getDonationById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const donation = await donationService.getDonationById(id);

  if (!donation) {
    throw new NotFoundError('Donation not found');
  }

  const response: ApiResponse = {
    success: true,
    data: donation,
  };

  res.json(response);
});

/**
 * Get all donations for a cause
 * GET /causes/:causeId/donations
 */
export const getDonationsByCause = asyncHandler(async (req: Request, res: Response) => {
  const { causeId } = req.params;
  
  // Verify cause exists
  const cause = await causeService.getCauseById(causeId);
  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const donations = await donationService.getDonationsByCause(causeId);

  // Mask donor phone for privacy (show last 4 digits only)
  const maskedDonations = donations.map(d => ({
    ...d,
    donorPhone: maskPhone(d.donorPhone),
    amount: d.amount.toString(),
  }));

  const response: ApiResponse = {
    success: true,
    data: {
      cause: {
        id: cause.id,
        name: cause.name,
      },
      donations: maskedDonations,
      count: donations.length,
    },
  };

  res.json(response);
});

/**
 * Get all donations by donor phone
 * GET /donor/:phone/donations
 */
export const getDonationsByDonor = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.params;
  
  const donations = await donationService.getDonationsByDonor(phone);

  const formattedDonations = donations.map(d => ({
    ...d,
    amount: d.amount.toString(),
  }));

  const response: ApiResponse = {
    success: true,
    data: {
      donorPhone: phone,
      donations: formattedDonations,
      count: donations.length,
    },
  };

  res.json(response);
});

/**
 * Check/sync donation status from MoMo
 * GET /donations/:id/status
 */
export const checkDonationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const donation = await donationService.syncDonationStatus(id);

  if (!donation) {
    throw new NotFoundError('Donation not found');
  }

  const response: ApiResponse = {
    success: true,
    data: {
      id: donation.id,
      status: donation.status,
      momoRefId: donation.momoRefId,
      updatedAt: donation.updatedAt,
    },
  };

  res.json(response);
});

/**
 * Helper: Mask phone number for privacy
 */
function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return '*'.repeat(phone.length - 4) + phone.slice(-4);
}

