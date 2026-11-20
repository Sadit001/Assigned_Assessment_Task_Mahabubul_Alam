import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CircularDependencyError } from '../algorithms/graph.js';
import { ConflictError, NotFoundError, BadRequestError } from '../services/movie.service.js';
import { ENV } from '../config/env.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 1. Circular Dependency Error -> HTTP 409
  if (err instanceof CircularDependencyError || err.code === 'CIRCULAR_DEPENDENCY') {
    res.status(409).json({
      error: 'CIRCULAR_DEPENDENCY',
      message: err.message,
      cyclePath: err.cyclePath || [],
    });
    return;
  }

  // 2. Conflict Error (e.g. Duplicate Title, Duplicate Cinema Name) -> HTTP 409
  if (err instanceof ConflictError) {
    res.status(409).json({
      error: err.code,
      message: err.message,
    });
    return;
  }

  // 3. Not Found Error -> HTTP 404
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: err.message,
    });
    return;
  }

  // 4. Bad Request Error -> HTTP 400
  if (err instanceof BadRequestError) {
    res.status(400).json({
      error: 'BAD_REQUEST',
      message: err.message,
    });
    return;
  }

  // 5. Zod Schema Validation Error -> HTTP 400
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: formattedErrors,
    });
    return;
  }

  // 6. Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    res.status(409).json({
      error: 'CONFLICT',
      message: `A record with this ${target} already exists`,
    });
    return;
  }

  // 7. General unexpected errors -> HTTP 500
  const isDev = ENV.NODE_ENV === 'development';
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred',
    ...(isDev && { stack: err.stack }),
  });
}
