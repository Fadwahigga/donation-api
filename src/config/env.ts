import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Environment configuration
 * Validates and exports all required environment variables
 */

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  
  // Database
  DATABASE_URL: string;
  
  // Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // MoMo API
  MOMO_BASE_URL: string;
  MOMO_SUBSCRIPTION_KEY: string;
  MOMO_API_USER_ID: string;
  MOMO_API_KEY: string;
  MOMO_TARGET_ENVIRONMENT: string;
  MOMO_COLLECTION_CALLBACK_URL: string;
  MOMO_DISBURSEMENT_CALLBACK_URL: string;
}

/**
 * Get required environment variable or throw error
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Validate and export environment configuration
 */
export const env: EnvConfig = {
  // Server configuration
  PORT: parseInt(getEnvVar('PORT', '3000'), 10),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // Database
  DATABASE_URL: getEnvVar('DATABASE_URL'),
  
  // Authentication
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-secret-key-change-in-production'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  
  // MoMo API configuration
  MOMO_BASE_URL: getEnvVar('MOMO_BASE_URL', 'https://sandbox.momodeveloper.mtn.com'),
  MOMO_SUBSCRIPTION_KEY: getEnvVar('MOMO_SUBSCRIPTION_KEY'),
  MOMO_API_USER_ID: getEnvVar('MOMO_API_USER_ID'),
  MOMO_API_KEY: getEnvVar('MOMO_API_KEY'),
  MOMO_TARGET_ENVIRONMENT: getEnvVar('MOMO_TARGET_ENVIRONMENT', 'sandbox'),
  MOMO_COLLECTION_CALLBACK_URL: getEnvVar('MOMO_COLLECTION_CALLBACK_URL', ''),
  MOMO_DISBURSEMENT_CALLBACK_URL: getEnvVar('MOMO_DISBURSEMENT_CALLBACK_URL', ''),
};

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

