import { Request, Response, NextFunction } from 'express';
import { ValidationError, BadRequestError } from './errorHandler';

/**
 * Input validation middleware
 */

/**
 * Validate phone number format
 * Accepts international format with + prefix or numbers only
 */
export function isValidPhone(phone: string): boolean {
  // Basic validation: allows digits, optional + prefix, min 8 chars
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate amount (positive number)
 */
export function isValidAmount(amount: string | number): boolean {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
}

/**
 * MTN Mobile Money supported currencies
 * These are the currencies supported by MTN MoMo API across different countries
 */
const SUPPORTED_CURRENCIES = [
  'XAF', // Central African CFA Franc (Cameroon, Chad, Central African Republic, etc.)
  'XOF', // West African CFA Franc (Côte d'Ivoire, Senegal, etc.)
  'UGX', // Ugandan Shilling
  'GHS', // Ghanaian Cedi
  'ZAR', // South African Rand
  'NGN', // Nigerian Naira
  'ZMW', // Zambian Kwacha
  'RWF', // Rwandan Franc
  'TZS', // Tanzanian Shilling
  'KES', // Kenyan Shilling
  'ETB', // Ethiopian Birr
  'MWK', // Malawian Kwacha
  'MZN', // Mozambican Metical
  'USD', // US Dollar (if supported in your region)
  'EUR', // Euro (if supported in your region)
  'GBP', // British Pound (if supported in your region)
];

/**
 * Validate currency code (must be a supported MTN MoMo currency)
 */
export function isValidCurrency(currency: string): boolean {
  if (!currency || typeof currency !== 'string') {
    return false;
  }
  // Convert to uppercase for case-insensitive comparison
  const upperCurrency = currency.toUpperCase().trim();
  // Check if it's a valid 3-letter ISO code and in supported list
  return /^[A-Z]{3}$/.test(upperCurrency) && SUPPORTED_CURRENCIES.includes(upperCurrency);
}

/**
 * Get list of supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return [...SUPPORTED_CURRENCIES];
}

/**
 * Middleware: Validate donation request body
 */
export function validateDonationRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { causeId, amount, currency, donorPhone } = req.body;

  const errors: string[] = [];

  if (!causeId) {
    errors.push('causeId is required');
  } else if (!isValidUUID(causeId)) {
    errors.push('causeId must be a valid UUID');
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (!isValidAmount(amount)) {
    errors.push('amount must be a positive number');
  }

  if (!currency) {
    errors.push('currency is required');
  } else if (!isValidCurrency(currency)) {
    errors.push(`currency must be a supported MTN MoMo currency. Supported currencies: ${getSupportedCurrencies().join(', ')}`);
  }

  if (!donorPhone) {
    errors.push('donorPhone is required');
  } else if (!isValidPhone(donorPhone)) {
    errors.push('donorPhone must be a valid phone number');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
}

/**
 * Middleware: Validate payout request body
 */
export function validatePayoutRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { causeId, amount, currency } = req.body;

  const errors: string[] = [];

  if (!causeId) {
    errors.push('causeId is required');
  } else if (!isValidUUID(causeId)) {
    errors.push('causeId must be a valid UUID');
  }

  if (amount === undefined || amount === null || amount === '') {
    errors.push('amount is required');
  } else if (!isValidAmount(amount)) {
    errors.push('amount must be a positive number');
  }

  if (!currency) {
    errors.push('currency is required');
  } else if (!isValidCurrency(currency)) {
    errors.push(`currency must be a supported MTN MoMo currency. Supported currencies: ${getSupportedCurrencies().join(', ')}`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
}

/**
 * Middleware: Validate cause request body
 */
export function validateCauseRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { name, ownerPhone } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  if (!ownerPhone) {
    errors.push('ownerPhone is required');
  } else if (!isValidPhone(ownerPhone)) {
    errors.push('ownerPhone must be a valid phone number');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
}

/**
 * Middleware: Validate UUID parameter
 */
export function validateUUIDParam(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const param = req.params[paramName];

    if (!param || !isValidUUID(param)) {
      throw new BadRequestError(`${paramName} must be a valid UUID`);
    }

    next();
  };
}

/**
 * Middleware: Validate phone parameter
 */
export function validatePhoneParam(paramName: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const param = req.params[paramName];

    if (!param || !isValidPhone(param)) {
      throw new BadRequestError(`${paramName} must be a valid phone number`);
    }

    next();
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Middleware: Validate register request body
 */
export function validateRegisterRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { email, password, name, phone } = req.body;

  const errors: string[] = [];

  if (!email) {
    errors.push('email is required');
  } else if (!isValidEmail(email)) {
    errors.push('email must be a valid email address');
  }

  if (!password) {
    errors.push('password is required');
  } else if (password.length < 6) {
    errors.push('password must be at least 6 characters long');
  }

  if (phone && !isValidPhone(phone)) {
    errors.push('phone must be a valid phone number');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
}

/**
 * Middleware: Validate login request body
 */
export function validateLoginRequest(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { email, password } = req.body;

  const errors: string[] = [];

  if (!email) {
    errors.push('email is required');
  } else if (!isValidEmail(email)) {
    errors.push('email must be a valid email address');
  }

  if (!password) {
    errors.push('password is required');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
}

