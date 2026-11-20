import { getDatabase, DbCinema } from '../config/database.js';
import { calculateOptimalBooking, BookingResult } from '../algorithms/booking.js';
import { CreateCinemaInput } from '../validators/cinema.validator.js';
import { ConflictError, NotFoundError } from './movie.service.js';

export interface CinemaBookingResponse extends BookingResult {
  cinema: {
    id: string;
    name: string;
  };
}

export class CinemaService {
  async getAllCinemas(): Promise<DbCinema[]> {
    const db = await getDatabase();
    return db.getAllCinemas();
  }

  async getCinemaById(id: string): Promise<DbCinema> {
    const db = await getDatabase();
    const cinema = await db.getCinemaById(id);
    if (!cinema) {
      throw new NotFoundError(`Cinema with ID ${id} not found`);
    }
    return cinema;
  }

  async createCinema(input: CreateCinemaInput): Promise<DbCinema> {
    const db = await getDatabase();

    // Verify name uniqueness
    const existing = await db.getCinemaByName(input.name);
    if (existing) {
      throw new ConflictError(
        'DUPLICATE_CINEMA_NAME',
        `A cinema named "${input.name}" already exists`
      );
    }

    return db.createCinema({
      name: input.name,
      bundleSizes: input.bundleSizes,
    });
  }

  async deleteCinema(id: string): Promise<void> {
    const db = await getDatabase();
    const cinema = await db.getCinemaById(id);
    if (!cinema) {
      throw new NotFoundError(`Cinema with ID ${id} not found`);
    }
    await db.deleteCinema(id);
  }

  async getBookingQuote(cinemaId: string, groupSize: number): Promise<CinemaBookingResponse> {
    const db = await getDatabase();
    const cinema = await db.getCinemaById(cinemaId);
    if (!cinema) {
      throw new NotFoundError(`Cinema with ID ${cinemaId} not found`);
    }

    const bundleSizes = cinema.bundles.map(b => b.bundleSize);
    const result = calculateOptimalBooking(bundleSizes, groupSize);

    return {
      ...result,
      cinema: {
        id: cinema.id,
        name: cinema.name,
      },
    };
  }
}

export const cinemaService = new CinemaService();
