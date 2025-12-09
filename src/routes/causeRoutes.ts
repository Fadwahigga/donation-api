import { Router } from 'express';
import { causeController } from '../controllers';
import { validateCauseRequest, validateUUIDParam } from '../middleware';

/**
 * Cause Routes
 * /causes
 */

const router = Router();

// GET /causes - Get all causes
router.get('/', causeController.getAllCauses);

// POST /causes - Create a new cause
router.post('/', validateCauseRequest, causeController.createCause);

// GET /causes/:id - Get cause by ID
router.get('/:id', validateUUIDParam('id'), causeController.getCauseById);

// PUT /causes/:id - Update a cause
router.put('/:id', validateUUIDParam('id'), causeController.updateCause);

// DELETE /causes/:id - Delete a cause
router.delete('/:id', validateUUIDParam('id'), causeController.deleteCause);

export default router;

