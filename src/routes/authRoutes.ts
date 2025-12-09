import { Router } from 'express';
import { authController } from '../controllers';
import { validateRegisterRequest, validateLoginRequest, authenticate } from '../middleware';

/**
 * Auth Routes
 * /auth
 */

const router = Router();

// POST /auth/register - Register a new user
router.post('/register', validateRegisterRequest, authController.register);

// POST /auth/login - Login user
router.post('/login', validateLoginRequest, authController.login);

// POST /auth/logout - Logout user (protected)
router.post('/logout', authenticate, authController.logout);

// GET /auth/me - Get current user profile (protected)
router.get('/me', authenticate, authController.getCurrentUser);

export default router;

