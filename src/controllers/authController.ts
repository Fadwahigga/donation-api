import { Request, Response } from 'express';
import { authService } from '../services';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware';

/**
 * Auth Controller
 * Handles HTTP requests for authentication-related operations
 */

/**
 * Register a new user
 * POST /auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;

  const result = await authService.register({
    email,
    password,
    name,
    phone,
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user: result.user,
      token: result.token,
    },
    message: 'User registered successfully',
  };

  res.status(201).json(response);
});

/**
 * Login user
 * POST /auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login({
    email,
    password,
  });

  const response: ApiResponse = {
    success: true,
    data: {
      user: result.user,
      token: result.token,
    },
    message: 'Login successful',
  };

  res.json(response);
});

/**
 * Get current user profile
 * GET /auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
    });
    return;
  }

  const user = await authService.getUserById(req.user.userId);

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'User not found',
    });
    return;
  }

  const response: ApiResponse = {
    success: true,
    data: user,
  };

  res.json(response);
});

