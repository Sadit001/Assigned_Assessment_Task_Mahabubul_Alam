import { Request, Response, NextFunction } from 'express';
import { cinemaService } from '../services/cinema.service.js';
import {
  createCinemaSchema,
  bookingQuerySchema,
  cinemaIdParamSchema,
} from '../validators/cinema.validator.js';

export class CinemaController {
  /**
   * GET /api/cinemas
   * Returns list of all cinemas with their bundle sizes.
   */
  async getAllCinemas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cinemas = await cinemaService.getAllCinemas();
      res.status(200).json(cinemas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cinemas/:id
   * Returns single cinema by ID.
   */
  async getCinemaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = cinemaIdParamSchema.parse(req.params);
      const cinema = await cinemaService.getCinemaById(id);
      res.status(200).json(cinema);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cinemas
   * Creates a new cinema with valid bundle sizes (1-10 sizes, 1-500 seats each).
   */
  async createCinema(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createCinemaSchema.parse(req.body);
      const cinema = await cinemaService.createCinema(input);
      res.status(201).json(cinema);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cinemas/:id
   * Deletes a cinema.
   */
  async deleteCinema(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = cinemaIdParamSchema.parse(req.params);
      await cinemaService.deleteCinema(id);
      res.status(200).json({ message: 'Cinema deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cinemas/:id/booking?groupSize=X
   * Calculates minimum bundle combination to seat the group size exactly.
   */
  async getBookingQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = cinemaIdParamSchema.parse(req.params);
      const { groupSize } = bookingQuerySchema.parse(req.query);
      const quote = await cinemaService.getBookingQuote(id, groupSize);
      res.status(200).json(quote);
    } catch (error) {
      next(error);
    }
  }
}

export const cinemaController = new CinemaController();
