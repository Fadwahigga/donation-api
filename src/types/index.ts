/**
 * Type definitions for the Donation API
 */

// ============================================
// Request/Response Types
// ============================================

/**
 * Donation request body
 */
export interface CreateDonationRequest {
  causeId: string;
  amount: string | number;
  currency: string;
  donorPhone: string;
  payerMessage?: string;
}

/**
 * Payout request body
 */
export interface CreatePayoutRequest {
  causeId: string;
  amount: string | number;
  currency: string;
}

/**
 * Cause creation request body
 */
export interface CreateCauseRequest {
  name: string;
  description?: string;
  ownerPhone: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// MoMo API Types
// ============================================

/**
 * MoMo RequestToPay request payload
 */
export interface MoMoRequestToPayPayload {
  amount: string;
  currency: string;
  externalId: string;
  payer: {
    partyIdType: 'MSISDN';
    partyId: string; // Phone number
  };
  payerMessage?: string;
  payeeNote?: string;
}

/**
 * MoMo Transfer (Disbursement) request payload
 */
export interface MoMoTransferPayload {
  amount: string;
  currency: string;
  externalId: string;
  payee: {
    partyIdType: 'MSISDN';
    partyId: string; // Phone number
  };
  payerMessage?: string;
  payeeNote?: string;
}

/**
 * MoMo payment status response
 */
export interface MoMoPaymentStatus {
  referenceId: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  financialTransactionId?: string;
  reason?: {
    code: string;
    message: string;
  };
}

/**
 * MoMo access token response
 */
export interface MoMoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================
// Status Types
// ============================================

export type DonationStatus = 'pending' | 'success' | 'failed';
export type PayoutStatus = 'pending' | 'completed' | 'failed';

// ============================================
// Service Result Types
// ============================================

export interface PaymentInitResult {
  success: boolean;
  referenceId?: string;
  error?: string;
}

export interface PaymentStatusResult {
  status: DonationStatus | PayoutStatus;
  momoStatus?: string;
  financialTransactionId?: string;
  error?: string;
}

