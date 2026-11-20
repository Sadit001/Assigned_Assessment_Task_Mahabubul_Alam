import { z } from 'zod';

export const createCinemaSchema = z.object({
  name: z
    .string({ required_error: 'Cinema name is required' })
    .trim()
    .min(1, 'Cinema name cannot be empty')
    .max(255, 'Cinema name cannot exceed 255 characters'),
  bundleSizes: z
    .array(
      z
        .number({ required_error: 'Bundle size must be a number' })
        .int('Bundle size must be an integer')
        .min(1, 'Bundle size must be at least 1 seat')
        .max(500, 'Bundle size cannot exceed 500 seats')
    )
    .min(1, 'Cinema must have at least 1 bundle size')
    .max(10, 'Cinema cannot have more than 10 bundle sizes')
    .refine(
      bundles => new Set(bundles).size === bundles.length,
      'Duplicate bundle sizes are not allowed'
    ),
});

export const bookingQuerySchema = z.object({
  groupSize: z
    .string({ required_error: 'groupSize query parameter is required' })
    .transform(val => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int('Group size must be an integer')
        .min(1, 'Group size must be at least 1')
        .max(10000, 'Group size cannot exceed 10,000')
    ),
});

export const cinemaIdParamSchema = z.object({
  id: z.string().min(1, 'Cinema ID is required'),
});

export type CreateCinemaInput = z.infer<typeof createCinemaSchema>;
