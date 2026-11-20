import { z } from 'zod';

export const createMovieSchema = z.object({
  title: z
    .string({ required_error: 'Movie title is required' })
    .trim()
    .min(1, 'Movie title cannot be empty')
    .max(255, 'Movie title cannot exceed 255 characters'),
  releaseYear: z
    .number({ required_error: 'Release year is required' })
    .int('Release year must be an integer')
    .min(1900, 'Release year must be at least 1900')
    .max(2100, 'Release year must be at most 2100'),
  runtime: z
    .number({ required_error: 'Runtime is required' })
    .int('Runtime must be an integer')
    .min(1, 'Runtime must be at least 1 minute')
    .max(300, 'Runtime must not exceed 300 minutes'),
  prerequisiteIds: z
    .array(z.string().min(1, 'Prerequisite ID cannot be empty'))
    .optional()
    .default([])
    .transform(ids => Array.from(new Set(ids))), // remove duplicates
  watched: z
    .boolean()
    .optional()
    .default(false),
});

export const updateMovieSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Movie title cannot be empty')
    .max(255, 'Movie title cannot exceed 255 characters')
    .optional(),
  releaseYear: z
    .number()
    .int('Release year must be an integer')
    .min(1900, 'Release year must be at least 1900')
    .max(2100, 'Release year must be at most 2100')
    .optional(),
  runtime: z
    .number()
    .int('Runtime must be an integer')
    .min(1, 'Runtime must be at least 1 minute')
    .max(300, 'Runtime must not exceed 300 minutes')
    .optional(),
  prerequisiteIds: z
    .array(z.string().min(1, 'Prerequisite ID cannot be empty'))
    .optional()
    .transform(ids => (ids ? Array.from(new Set(ids)) : undefined)),
  watched: z.boolean().optional(),
});

export const movieIdParamSchema = z.object({
  id: z.string().min(1, 'Movie ID is required'),
});

export const movieQuerySchema = z.object({
  search: z.string().optional(),
  watched: z
    .string()
    .optional()
    .transform(val => (val === undefined ? undefined : val === 'true')),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
