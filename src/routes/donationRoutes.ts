import { Router } from 'express';
import { donationController } from '../controllers';
import { 
  validateDonationRequest, 
  validateUUIDParam, 
  validatePhoneParam 
} from '../middleware';

/**
 * Donation Routes
 */

const router = Router();

// POST /donate - Create a new donation (initiate payment)
router.post('/donate', validateDonationRequest, donationController.createDonation);

// GET /donations/:id - Get donation by ID
router.get(
  '/donations/:id', 
  validateUUIDParam('id'), 
  donationController.getDonationById
);

// GET /donations/:id/status - Check/sync donation status
router.get(
  '/donations/:id/status', 
  validateUUIDParam('id'), 
  donationController.checkDonationStatus
);

// GET /causes/:causeId/donations - Get all donations for a cause
router.get(
  '/causes/:causeId/donations', 
  validateUUIDParam('causeId'), 
  donationController.getDonationsByCause
);

// GET /donor/:phone/donations - Get all donations by donor phone
router.get(
  '/donor/:phone/donations', 
  validatePhoneParam('phone'), 
  donationController.getDonationsByDonor
);

export default router;

