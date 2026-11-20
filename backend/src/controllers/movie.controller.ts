import { Request, Response, NextFunction } from 'express';
import { movieService } from '../services/movie.service.js';
import {
  createMovieSchema,
  updateMovieSchema,
  movieIdParamSchema,
  movieQuerySchema,
} from '../validators/movie.validator.js';

export class MovieController {
  /**
   * GET /api/movies
   * Returns list of all movies, optionally filtered by search or watched status.
   */
  async getAllMovies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = movieQuerySchema.parse(req.query);
      const movies = await movieService.getAllMovies(query);
      res.status(200).json(movies);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/:id
   * Returns single movie by ID.
   */
  async getMovieById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = movieIdParamSchema.parse(req.params);
      const movie = await movieService.getMovieById(id);
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/movies
   * Creates a new movie with validated prerequisites and cycle detection.
   */
  async createMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createMovieSchema.parse(req.body);
      const movie = await movieService.createMovie(input);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/movies/:id
   * Updates an existing movie's details, watched state, or prerequisites.
   */
  async updateMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = movieIdParamSchema.parse(req.params);
      const input = updateMovieSchema.parse(req.body);
      const updated = await movieService.updateMovie(id, input);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/movies/:id
   * Deletes a movie.
   */
  async deleteMovie(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = movieIdParamSchema.parse(req.params);
      await movieService.deleteMovie(id);
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/movies/:id/rewatch-order
   * Calculates valid rewatch order for the target movie using Topological Sort.
   */
  async getRewatchOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = movieIdParamSchema.parse(req.params);
      const result = await movieService.getRewatchOrder(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const movieController = new MovieController();
