import { prisma } from '../config/database';
import { CreateCauseRequest } from '../types';
import { logger } from '../utils/logger';
import { Cause } from '@prisma/client';

/**
 * Cause Service
 * Handles all business logic related to causes
 */

/**
 * Create a new cause
 */
export async function createCause(data: CreateCauseRequest): Promise<Cause> {
  logger.info('Creating new cause:', { name: data.name });
  
  const cause = await prisma.cause.create({
    data: {
      name: data.name,
      description: data.description,
      ownerPhone: data.ownerPhone,
    },
  });

  logger.info('Cause created:', { id: cause.id });
  return cause;
}

/**
 * Get cause by ID
 */
export async function getCauseById(id: string): Promise<Cause | null> {
  return prisma.cause.findUnique({
    where: { id },
  });
}

/**
 * Get all causes
 */
export async function getAllCauses(): Promise<Cause[]> {
  return prisma.cause.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Update a cause
 */
export async function updateCause(
  id: string,
  data: Partial<CreateCauseRequest>
): Promise<Cause | null> {
  const cause = await prisma.cause.findUnique({ where: { id } });
  
  if (!cause) {
    return null;
  }

  return prisma.cause.update({
    where: { id },
    data,
  });
}

/**
 * Delete a cause
 */
export async function deleteCause(id: string): Promise<boolean> {
  const cause = await prisma.cause.findUnique({ where: { id } });
  
  if (!cause) {
    return false;
  }

  await prisma.cause.delete({ where: { id } });
  logger.info('Cause deleted:', { id });
  return true;
}

