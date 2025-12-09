import { Request, Response } from 'express';
import { causeService } from '../services';
import { ApiResponse, CreateCauseRequest } from '../types';
import { NotFoundError, asyncHandler } from '../middleware';

/**
 * Cause Controller
 * Handles HTTP requests for cause-related operations
 */

/**
 * Create a new cause
 * POST /causes
 */
export const createCause = asyncHandler(async (req: Request, res: Response) => {
  const data: CreateCauseRequest = req.body;
  
  const cause = await causeService.createCause(data);

  const response: ApiResponse = {
    success: true,
    data: cause,
    message: 'Cause created successfully',
  };

  res.status(201).json(response);
});

/**
 * Get all causes
 * GET /causes
 */
export const getAllCauses = asyncHandler(async (_req: Request, res: Response) => {
  const causes = await causeService.getAllCauses();

  const response: ApiResponse = {
    success: true,
    data: causes,
  };

  res.json(response);
});

/**
 * Get cause by ID
 * GET /causes/:id
 */
export const getCauseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const cause = await causeService.getCauseById(id);

  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const response: ApiResponse = {
    success: true,
    data: cause,
  };

  res.json(response);
});

/**
 * Update a cause
 * PUT /causes/:id
 */
export const updateCause = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: Partial<CreateCauseRequest> = req.body;
  
  const cause = await causeService.updateCause(id, data);

  if (!cause) {
    throw new NotFoundError('Cause not found');
  }

  const response: ApiResponse = {
    success: true,
    data: cause,
    message: 'Cause updated successfully',
  };

  res.json(response);
});

/**
 * Delete a cause
 * DELETE /causes/:id
 */
export const deleteCause = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const deleted = await causeService.deleteCause(id);

  if (!deleted) {
    throw new NotFoundError('Cause not found');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Cause deleted successfully',
  };

  res.json(response);
});

