import { getDatabase, DbMovie } from '../config/database.js';
import {
  detectCycle,
  computeRewatchOrder,
  CircularDependencyError,
  RewatchOrderResult,
  MovieNode,
} from '../algorithms/graph.js';
import { CreateMovieInput, UpdateMovieInput } from '../validators/movie.validator.js';

export class ConflictError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'ConflictError';
    this.code = code;
  }
}

export class NotFoundError extends Error {
  public readonly code = 'NOT_FOUND';
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  public readonly code = 'BAD_REQUEST';
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class MovieService {
  /**
   * List all movies with optional search query or watched status filter.
   */
  async getAllMovies(filters?: { search?: string; watched?: boolean }): Promise<DbMovie[]> {
    const db = await getDatabase();
    return db.getAllMovies(filters);
  }

  /**
   * Find a movie by ID.
   */
  async getMovieById(id: string): Promise<DbMovie> {
    const db = await getDatabase();
    const movie = await db.getMovieById(id);
    if (!movie) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  /**
   * Create a new movie with graph validation (cycle detection).
   */
  async createMovie(input: CreateMovieInput): Promise<DbMovie> {
    const db = await getDatabase();

    // 1. Verify title uniqueness
    const existingTitle = await db.getMovieByTitle(input.title);
    if (existingTitle) {
      throw new ConflictError('DUPLICATE_TITLE', `A movie titled "${input.title}" already exists`);
    }

    // 2. If prerequisites specified, verify they all exist
    const allMovies = await db.getAllMovies();
    const existingIds = new Set(allMovies.map(m => m.id));

    if (input.prerequisiteIds && input.prerequisiteIds.length > 0) {
      for (const prereqId of input.prerequisiteIds) {
        if (!existingIds.has(prereqId)) {
          throw new BadRequestError(`Prerequisite movie with ID ${prereqId} does not exist`);
        }
      }

      // Graph validation: Check for cycles (temporary ID for new movie)
      const tempId = `temp-create-${Date.now()}`;
      const graphNodes = allMovies.map(m => ({
        id: m.id,
        prerequisiteIds: m.prerequisiteIds,
      }));

      // Will throw CircularDependencyError (409) if cycle detected
      detectCycle(graphNodes, tempId, input.prerequisiteIds);
    }

    // 3. Persist to database
    return db.createMovie({
      title: input.title,
      releaseYear: input.releaseYear,
      runtime: input.runtime,
      watched: input.watched,
      prerequisiteIds: input.prerequisiteIds,
    });
  }

  /**
   * Update an existing movie's details, watched state, or prerequisites with cycle detection.
   */
  async updateMovie(id: string, input: UpdateMovieInput): Promise<DbMovie> {
    const db = await getDatabase();

    // 1. Verify target movie exists
    const current = await db.getMovieById(id);
    if (!current) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }

    // 2. Check title uniqueness if changing title
    if (input.title && input.title.trim().toLowerCase() !== current.title.toLowerCase()) {
      const existingTitle = await db.getMovieByTitle(input.title);
      if (existingTitle && existingTitle.id !== id) {
        throw new ConflictError('DUPLICATE_TITLE', `A movie titled "${input.title}" already exists`);
      }
    }

    // 3. If prerequisites are being modified, perform cycle validation
    if (input.prerequisiteIds !== undefined) {
      const allMovies = await db.getAllMovies();
      const existingIds = new Set(allMovies.map(m => m.id));

      for (const prereqId of input.prerequisiteIds) {
        if (!existingIds.has(prereqId)) {
          throw new BadRequestError(`Prerequisite movie with ID ${prereqId} does not exist`);
        }
      }

      const graphNodes = allMovies.map(m => ({
        id: m.id,
        prerequisiteIds: m.prerequisiteIds,
      }));

      // Will throw CircularDependencyError (409) if cycle detected
      detectCycle(graphNodes, id, input.prerequisiteIds);
    }

    // 4. Update in database
    const updated = await db.updateMovie(id, {
      title: input.title,
      releaseYear: input.releaseYear,
      runtime: input.runtime,
      watched: input.watched,
      prerequisiteIds: input.prerequisiteIds,
    });

    if (!updated) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }

    return updated;
  }

  /**
   * Delete a movie.
   */
  async deleteMovie(id: string): Promise<void> {
    const db = await getDatabase();
    const movie = await db.getMovieById(id);
    if (!movie) {
      throw new NotFoundError(`Movie with ID ${id} not found`);
    }
    await db.deleteMovie(id);
  }

  /**
   * Calculate valid rewatch order for target movie using Topological Sort.
   */
  async getRewatchOrder(id: string): Promise<RewatchOrderResult> {
    const db = await getDatabase();
    const target = await db.getMovieById(id);
    if (!target) {
      throw new NotFoundError(`Target movie with ID ${id} not found`);
    }

    const allMovies = await db.getAllMovies();
    const movieNodes: MovieNode[] = allMovies.map(m => ({
      id: m.id,
      title: m.title,
      releaseYear: m.releaseYear,
      runtime: m.runtime,
      watched: m.watched,
      prerequisiteIds: m.prerequisiteIds,
    }));

    return computeRewatchOrder(id, movieNodes);
  }
}

export const movieService = new MovieService();
