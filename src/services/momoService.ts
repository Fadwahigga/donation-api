import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  MoMoRequestToPayPayload,
  MoMoTransferPayload,
  MoMoPaymentStatus,
  MoMoTokenResponse,
  PaymentInitResult,
  PaymentStatusResult,
} from '../types';

/**
 * MoMo Mobile Money Service
 * Handles all interactions with MoMo API including:
 * - Token generation/refresh
 * - Request to Pay (Collections)
 * - Transfer/Disbursement
 * - Payment status checks
 */
class MoMoService {
  private collectionClient: AxiosInstance;
  private disbursementClient: AxiosInstance;
  private collectionToken: string | null = null;
  private disbursementToken: string | null = null;
  private collectionTokenExpiry: Date | null = null;
  private disbursementTokenExpiry: Date | null = null;

  constructor() {
    // Collection API client (for receiving donations)
    this.collectionClient = axios.create({
      baseURL: `${env.MOMO_BASE_URL}/collection`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': env.MOMO_COLLECTION_SUBSCRIPTION_KEY,
      },
    });

    // Disbursement API client (for payouts)
    this.disbursementClient = axios.create({
      baseURL: `${env.MOMO_BASE_URL}/disbursement`,
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': env.MOMO_DISBURSEMENT_SUBSCRIPTION_KEY,
      },
    });
  }

  /**
   * Get or refresh Collection API access token
   */
  private async getCollectionToken(): Promise<string> {
    // Check if current token is still valid (with 5 min buffer)
    if (
      this.collectionToken &&
      this.collectionTokenExpiry &&
      new Date() < new Date(this.collectionTokenExpiry.getTime() - 5 * 60 * 1000)
    ) {
      return this.collectionToken;
    }

    try {
      // Create Basic Auth credentials
      const credentials = Buffer.from(
        `${env.MOMO_API_USER_ID}:${env.MOMO_API_KEY}`
      ).toString('base64');

      const response = await this.collectionClient.post<MoMoTokenResponse>(
        '/token/',
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      this.collectionToken = response.data.access_token;
      this.collectionTokenExpiry = new Date(
        Date.now() + response.data.expires_in * 1000
      );

      logger.debug('Collection token refreshed');
      return this.collectionToken;
    } catch (error) {
      logger.error('Failed to get collection token:', error);
      throw new Error('Failed to authenticate with MoMo Collection API');
    }
  }

  /**
   * Get or refresh Disbursement API access token
   */
  private async getDisbursementToken(): Promise<string> {
    // Check if current token is still valid (with 5 min buffer)
    if (
      this.disbursementToken &&
      this.disbursementTokenExpiry &&
      new Date() < new Date(this.disbursementTokenExpiry.getTime() - 5 * 60 * 1000)
    ) {
      return this.disbursementToken;
    }

    try {
      const credentials = Buffer.from(
        `${env.MOMO_API_USER_ID}:${env.MOMO_API_KEY}`
      ).toString('base64');

      const response = await this.disbursementClient.post<MoMoTokenResponse>(
        '/token/',
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
          },
        }
      );

      this.disbursementToken = response.data.access_token;
      this.disbursementTokenExpiry = new Date(
        Date.now() + response.data.expires_in * 1000
      );

      logger.debug('Disbursement token refreshed');
      return this.disbursementToken;
    } catch (error) {
      logger.error('Failed to get disbursement token:', error);
      throw new Error('Failed to authenticate with MoMo Disbursement API');
    }
  }

  /**
   * Request to Pay - Initiate collection from donor
   * @param payload Payment request details
   * @returns Payment initialization result with reference ID
   */
  async requestToPay(payload: MoMoRequestToPayPayload): Promise<PaymentInitResult> {
    const referenceId = uuidv4();

    try {
      const token = await this.getCollectionToken();

      logger.info(`Initiating RequestToPay: ${referenceId}`, {
        amount: payload.amount,
        currency: payload.currency,
        externalId: payload.externalId,
      });

      // Build headers with conditional callback URL
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': env.MOMO_TARGET_ENVIRONMENT,
      };

      // Only include callback URL if it's configured and not empty
      if (env.MOMO_COLLECTION_CALLBACK_URL && env.MOMO_COLLECTION_CALLBACK_URL.trim() !== '') {
        headers['X-Callback-Url'] = env.MOMO_COLLECTION_CALLBACK_URL.trim();
      }

      await this.collectionClient.post(
        '/v1_0/requesttopay',
        payload,
        {
          headers,
        }
      );

      logger.info(`RequestToPay initiated successfully: ${referenceId}`);

      return {
        success: true,
        referenceId,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('RequestToPay failed:', {
        referenceId,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        headers: axiosError.response?.headers,
        data: axiosError.response?.data,
        payload: {
          amount: payload.amount,
          currency: payload.currency,
          externalId: payload.externalId,
          payerPartyId: payload.payer.partyId,
        },
        config: {
          url: axiosError.config?.url,
          method: axiosError.config?.method,
          baseURL: axiosError.config?.baseURL,
        },
      });

      return {
        success: false,
        referenceId,
        error: this.extractErrorMessage(axiosError),
      };
    }
  }

  /**
   * Get status of a Request to Pay transaction
   * @param referenceId The MoMo reference ID
   * @returns Payment status
   */
  async getRequestToPayStatus(referenceId: string): Promise<PaymentStatusResult> {
    try {
      const token = await this.getCollectionToken();

      const response = await this.collectionClient.get<MoMoPaymentStatus>(
        `/v1_0/requesttopay/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Target-Environment': env.MOMO_TARGET_ENVIRONMENT,
          },
        }
      );

      const status = this.mapMoMoStatusToDonationStatus(response.data.status);

      return {
        status,
        momoStatus: response.data.status,
        financialTransactionId: response.data.financialTransactionId,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to get RequestToPay status:', {
        referenceId,
        error: axiosError.message,
      });

      return {
        status: 'pending',
        error: this.extractErrorMessage(axiosError),
      };
    }
  }

  /**
   * Transfer funds - Disbursement to cause owner
   * @param payload Transfer request details
   * @returns Transfer initialization result with reference ID
   */
  async transfer(payload: MoMoTransferPayload): Promise<PaymentInitResult> {
    const referenceId = uuidv4();

    try {
      const token = await this.getDisbursementToken();

      logger.info(`Initiating Transfer: ${referenceId}`, {
        amount: payload.amount,
        currency: payload.currency,
        externalId: payload.externalId,
      });

      // Build headers with conditional callback URL
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': env.MOMO_TARGET_ENVIRONMENT,
      };

      // Only include callback URL if it's configured and not empty
      if (env.MOMO_DISBURSEMENT_CALLBACK_URL && env.MOMO_DISBURSEMENT_CALLBACK_URL.trim() !== '') {
        headers['X-Callback-Url'] = env.MOMO_DISBURSEMENT_CALLBACK_URL.trim();
      }

      await this.disbursementClient.post(
        '/v1_0/transfer',
        payload,
        {
          headers,
        }
      );

      logger.info(`Transfer initiated successfully: ${referenceId}`);

      return {
        success: true,
        referenceId,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Transfer failed:', {
        referenceId,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      return {
        success: false,
        referenceId,
        error: this.extractErrorMessage(axiosError),
      };
    }
  }

  /**
   * Get status of a Transfer transaction
   * @param referenceId The MoMo reference ID
   * @returns Transfer status
   */
  async getTransferStatus(referenceId: string): Promise<PaymentStatusResult> {
    try {
      const token = await this.getDisbursementToken();

      const response = await this.disbursementClient.get<MoMoPaymentStatus>(
        `/v1_0/transfer/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Target-Environment': env.MOMO_TARGET_ENVIRONMENT,
          },
        }
      );

      const status = this.mapMoMoStatusToPayoutStatus(response.data.status);

      return {
        status,
        momoStatus: response.data.status,
        financialTransactionId: response.data.financialTransactionId,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logger.error('Failed to get Transfer status:', {
        referenceId,
        error: axiosError.message,
      });

      return {
        status: 'pending',
        error: this.extractErrorMessage(axiosError),
      };
    }
  }

  /**
   * Map MoMo status to internal donation status
   */
  private mapMoMoStatusToDonationStatus(
    momoStatus: string
  ): 'pending' | 'success' | 'failed' {
    switch (momoStatus) {
      case 'SUCCESSFUL':
        return 'success';
      case 'FAILED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Map MoMo status to internal payout status
   */
  private mapMoMoStatusToPayoutStatus(
    momoStatus: string
  ): 'pending' | 'completed' | 'failed' {
    switch (momoStatus) {
      case 'SUCCESSFUL':
        return 'completed';
      case 'FAILED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Extract error message from Axios error
   */
  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      
      // Log full error response for debugging
      logger.error('MoMo API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: JSON.stringify(data),
      });
      
      // Try to extract meaningful error message
      if (typeof data === 'string') {
        return data;
      }
      
      if (data.message) {
        return data.message;
      }
      
      if (data.reason) {
        return data.reason;
      }
      
      if (data.error) {
        return typeof data.error === 'string' 
          ? data.error 
          : data.error.message || data.error.reason || 'Unknown error from MoMo API';
      }
      
      if (data.code) {
        return `MoMo API Error: ${data.code}${data.message ? ` - ${data.message}` : ''}`;
      }
      
      // If it's an array of errors
      if (Array.isArray(data)) {
        return data.map((err: any) => err.message || err).join(', ');
      }
      
      // Return stringified data as fallback
      return JSON.stringify(data);
    }
    return error.message || 'Unknown error';
  }
}

// Export singleton instance
export const momoService = new MoMoService();

