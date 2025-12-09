import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from './errorHandler';
import { verifyToken, getUserById } from '../services/authService';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid token');
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if missing
 */
export function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
}

/**
 * Authorization middleware - requires admin role
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Fetch user to check role
    const user = await getUserById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }
    
    req.user.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to require user to own resource or be admin
 * Assumes resource has userId field
 */
export function requireOwnerOrAdmin(
  resourceUserId: string | null | undefined
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Fetch user to check role
      const user = await getUserById(req.user.userId);
      
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // Admin can access any resource
      if (user.role === 'admin') {
        req.user.role = user.role;
        return next();
      }

      // User must own the resource
      if (resourceUserId && resourceUserId === req.user.userId) {
        return next();
      }

      throw new ForbiddenError('Access denied');
    } catch (error) {
      next(error);
    }
  };
}

