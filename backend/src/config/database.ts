import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { ENV } from './env.js';

export interface DbMovie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  createdAt: Date;
  updatedAt: Date;
  prerequisiteIds: string[];
  prerequisites?: Array<{ id: string; title: string; releaseYear: number; runtime: number; watched: boolean }>;
  dependentIds?: string[];
  dependents?: Array<{ id: string; title: string }>;
}

export interface DbCinema {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  bundles: Array<{ id: string; bundleSize: number }>;
}

export interface IDatabase {
  isPrisma(): boolean;
  // Movies
  getAllMovies(filters?: { search?: string; watched?: boolean }): Promise<DbMovie[]>;
  getMovieById(id: string): Promise<DbMovie | null>;
  getMovieByTitle(title: string): Promise<DbMovie | null>;
  createMovie(data: {
    title: string;
    releaseYear: number;
    runtime: number;
    watched?: boolean;
    prerequisiteIds?: string[];
  }): Promise<DbMovie>;
  updateMovie(
    id: string,
    data: {
      title?: string;
      releaseYear?: number;
      runtime?: number;
      watched?: boolean;
      prerequisiteIds?: string[];
    }
  ): Promise<DbMovie | null>;
  deleteMovie(id: string): Promise<boolean>;

  // Cinemas
  getAllCinemas(): Promise<DbCinema[]>;
  getCinemaById(id: string): Promise<DbCinema | null>;
  getCinemaByName(name: string): Promise<DbCinema | null>;
  createCinema(data: { name: string; bundleSizes: number[] }): Promise<DbCinema>;
  deleteCinema(id: string): Promise<boolean>;

  // Seeding
  seedIfEmpty(): Promise<void>;
  reset(): Promise<void>;
}

// -------------------------------------------------------------
// Sample Initial Data from Assessment
// -------------------------------------------------------------
export const SAMPLE_MOVIES_DATA = [
  {
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    watched: false,
    prerequisiteTitles: [],
  },
  {
    title: 'Captain America: The First Avenger',
    releaseYear: 2011,
    runtime: 124,
    watched: false,
    prerequisiteTitles: [],
  },
  {
    title: 'The Avengers',
    releaseYear: 2012,
    runtime: 143,
    watched: false,
    prerequisiteTitles: ['Iron Man', 'Captain America: The First Avenger'],
  },
  {
    title: 'Captain America: Civil War',
    releaseYear: 2016,
    runtime: 147,
    watched: false,
    prerequisiteTitles: ['The Avengers'],
  },
  {
    title: 'Thor: Ragnarok',
    releaseYear: 2017,
    runtime: 130,
    watched: false,
    prerequisiteTitles: [],
  },
  {
    title: 'Avengers: Infinity War',
    releaseYear: 2018,
    runtime: 149,
    watched: false,
    prerequisiteTitles: ['Captain America: Civil War', 'Thor: Ragnarok'],
  },
  {
    title: 'Avengers: Endgame',
    releaseYear: 2019,
    runtime: 181,
    watched: false,
    prerequisiteTitles: ['Avengers: Infinity War'],
  },
  {
    title: 'Avengers: Doomsday',
    releaseYear: 2026,
    runtime: 180,
    watched: false,
    prerequisiteTitles: ['Avengers: Endgame'],
  },
];

export const SAMPLE_CINEMAS_DATA = [
  { name: 'Stark Starkplex IMAX', bundleSizes: [1, 3, 4] },
  { name: 'Wakanda Grand Cinema', bundleSizes: [2, 5] },
  { name: 'Sanctum Sanctorum Theatres', bundleSizes: [6, 9, 20] },
  { name: 'Quantum Realm Odeon', bundleSizes: [4, 6] },
];

// -------------------------------------------------------------
// Persistent In-Memory / File-Backed Database
// -------------------------------------------------------------
class PersistentMemoryDatabase implements IDatabase {
  private movies: Map<string, DbMovie> = new Map();
  private moviePrerequisites: Map<string, Set<string>> = new Map(); // movieId -> Set(prereqId)
  private cinemas: Map<string, DbCinema> = new Map();
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'db.json');
    this.loadFromFile();
  }

  isPrisma(): boolean {
    return false;
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.movies && Array.isArray(parsed.movies)) {
          for (const m of parsed.movies) {
            this.movies.set(m.id, {
              ...m,
              createdAt: new Date(m.createdAt),
              updatedAt: new Date(m.updatedAt),
            });
            this.moviePrerequisites.set(m.id, new Set(m.prerequisiteIds || []));
          }
        }
        if (parsed.cinemas && Array.isArray(parsed.cinemas)) {
          for (const c of parsed.cinemas) {
            this.cinemas.set(c.id, {
              ...c,
              createdAt: new Date(c.createdAt),
              updatedAt: new Date(c.updatedAt),
            });
          }
        }
      }
    } catch {
      // In-memory fallback if file read fails
    }
  }

  private saveToFile(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = {
        movies: Array.from(this.movies.values()).map(m => ({
          ...m,
          prerequisiteIds: Array.from(this.moviePrerequisites.get(m.id) || []),
        })),
        cinemas: Array.from(this.cinemas.values()),
      };
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // Ignore write errors in restricted environments
    }
  }

  private formatMovie(m: DbMovie): DbMovie {
    const prereqIds = Array.from(this.moviePrerequisites.get(m.id) || []);
    const prereqObjs = prereqIds
      .map(id => this.movies.get(id))
      .filter((p): p is DbMovie => !!p)
      .map(p => ({
        id: p.id,
        title: p.title,
        releaseYear: p.releaseYear,
        runtime: p.runtime,
        watched: p.watched,
      }));

    // Find dependents: movies that have m.id as a prerequisite
    const depObjs: Array<{ id: string; title: string }> = [];
    for (const [depId, prereqs] of this.moviePrerequisites.entries()) {
      if (prereqs.has(m.id)) {
        const dep = this.movies.get(depId);
        if (dep) {
          depObjs.push({ id: dep.id, title: dep.title });
        }
      }
    }

    return {
      ...m,
      prerequisiteIds: prereqIds,
      prerequisites: prereqObjs,
      dependents: depObjs,
    };
  }

  async getAllMovies(filters?: { search?: string; watched?: boolean }): Promise<DbMovie[]> {
    let list = Array.from(this.movies.values()).map(m => this.formatMovie(m));
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      list = list.filter(m => m.title.toLowerCase().includes(query));
    }
    if (filters?.watched !== undefined) {
      list = list.filter(m => m.watched === filters.watched);
    }
    return list.sort((a, b) => a.releaseYear - b.releaseYear);
  }

  async getMovieById(id: string): Promise<DbMovie | null> {
    const m = this.movies.get(id);
    return m ? this.formatMovie(m) : null;
  }

  async getMovieByTitle(title: string): Promise<DbMovie | null> {
    for (const m of this.movies.values()) {
      if (m.title.toLowerCase() === title.trim().toLowerCase()) {
        return this.formatMovie(m);
      }
    }
    return null;
  }

  async createMovie(data: {
    title: string;
    releaseYear: number;
    runtime: number;
    watched?: boolean;
    prerequisiteIds?: string[];
  }): Promise<DbMovie> {
    const id = `movie-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();
    const movie: DbMovie = {
      id,
      title: data.title.trim(),
      releaseYear: data.releaseYear,
      runtime: data.runtime,
      watched: data.watched ?? false,
      createdAt: now,
      updatedAt: now,
      prerequisiteIds: data.prerequisiteIds || [],
    };

    this.movies.set(id, movie);
    this.moviePrerequisites.set(id, new Set(data.prerequisiteIds || []));
    this.saveToFile();
    return this.formatMovie(movie);
  }

  async updateMovie(
    id: string,
    data: {
      title?: string;
      releaseYear?: number;
      runtime?: number;
      watched?: boolean;
      prerequisiteIds?: string[];
    }
  ): Promise<DbMovie | null> {
    const existing = this.movies.get(id);
    if (!existing) return null;

    const updated: DbMovie = {
      ...existing,
      title: data.title !== undefined ? data.title.trim() : existing.title,
      releaseYear: data.releaseYear !== undefined ? data.releaseYear : existing.releaseYear,
      runtime: data.runtime !== undefined ? data.runtime : existing.runtime,
      watched: data.watched !== undefined ? data.watched : existing.watched,
      updatedAt: new Date(),
      prerequisiteIds: existing.prerequisiteIds,
    };

    if (data.prerequisiteIds !== undefined) {
      this.moviePrerequisites.set(id, new Set(data.prerequisiteIds));
      updated.prerequisiteIds = data.prerequisiteIds;
    }

    this.movies.set(id, updated);
    this.saveToFile();
    return this.formatMovie(updated);
  }

  async deleteMovie(id: string): Promise<boolean> {
    if (!this.movies.has(id)) return false;
    this.movies.delete(id);
    this.moviePrerequisites.delete(id);
    // Remove references to this movie from others
    for (const prereqs of this.moviePrerequisites.values()) {
      prereqs.delete(id);
    }
    this.saveToFile();
    return true;
  }

  async getAllCinemas(): Promise<DbCinema[]> {
    return Array.from(this.cinemas.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getCinemaById(id: string): Promise<DbCinema | null> {
    return this.cinemas.get(id) || null;
  }

  async getCinemaByName(name: string): Promise<DbCinema | null> {
    for (const c of this.cinemas.values()) {
      if (c.name.toLowerCase() === name.trim().toLowerCase()) {
        return c;
      }
    }
    return null;
  }

  async createCinema(data: { name: string; bundleSizes: number[] }): Promise<DbCinema> {
    const id = `cinema-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date();
    const sortedSizes = Array.from(new Set(data.bundleSizes)).sort((a, b) => a - b);
    const cinema: DbCinema = {
      id,
      name: data.name.trim(),
      createdAt: now,
      updatedAt: now,
      bundles: sortedSizes.map((s, idx) => ({
        id: `b-${id}-${idx}`,
        bundleSize: s,
      })),
    };
    this.cinemas.set(id, cinema);
    this.saveToFile();
    return cinema;
  }

  async deleteCinema(id: string): Promise<boolean> {
    if (!this.cinemas.has(id)) return false;
    this.cinemas.delete(id);
    this.saveToFile();
    return true;
  }

  async seedIfEmpty(): Promise<void> {
    if (this.movies.size === 0) {
      const createdIds = new Map<string, string>();

      // First pass: create all movies without prerequisites
      for (const m of SAMPLE_MOVIES_DATA) {
        const created = await this.createMovie({
          title: m.title,
          releaseYear: m.releaseYear,
          runtime: m.runtime,
          watched: m.watched,
          prerequisiteIds: [],
        });
        createdIds.set(m.title, created.id);
      }

      // Second pass: attach prerequisites
      for (const m of SAMPLE_MOVIES_DATA) {
        if (m.prerequisiteTitles.length > 0) {
          const movieId = createdIds.get(m.title)!;
          const prereqIds = m.prerequisiteTitles
            .map(t => createdIds.get(t))
            .filter((id): id is string => !!id);
          await this.updateMovie(movieId, { prerequisiteIds: prereqIds });
        }
      }
    }

    if (this.cinemas.size === 0) {
      for (const c of SAMPLE_CINEMAS_DATA) {
        await this.createCinema(c);
      }
    }
  }

  async reset(): Promise<void> {
    this.movies.clear();
    this.moviePrerequisites.clear();
    this.cinemas.clear();
    this.saveToFile();
  }
}

// -------------------------------------------------------------
// Prisma PostgreSQL Database Implementation
// -------------------------------------------------------------
class PrismaDatabase implements IDatabase {
  public client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  isPrisma(): boolean {
    return true;
  }

  async getAllMovies(filters?: { search?: string; watched?: boolean }): Promise<DbMovie[]> {
    const where: any = {};
    if (filters?.search) {
      where.title = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.watched !== undefined) {
      where.watched = filters.watched;
    }

    const records = await this.client.movie.findMany({
      where,
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        dependents: {
          include: {
            movie: true,
          },
        },
      },
      orderBy: { releaseYear: 'asc' },
    });

    return records.map((r: any) => ({
      id: r.id,
      title: r.title,
      releaseYear: r.releaseYear,
      runtime: r.runtime,
      watched: r.watched,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      prerequisiteIds: r.prerequisites.map((p: any) => p.prerequisiteMovieId),
      prerequisites: r.prerequisites.map((p: any) => ({
        id: p.prerequisite.id,
        title: p.prerequisite.title,
        releaseYear: p.prerequisite.releaseYear,
        runtime: p.prerequisite.runtime,
        watched: p.prerequisite.watched,
      })),
      dependents: r.dependents.map((d: any) => ({
        id: d.movie.id,
        title: d.movie.title,
      })),
    }));
  }

  async getMovieById(id: string): Promise<DbMovie | null> {
    const r = await this.client.movie.findUnique({
      where: { id },
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        dependents: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      releaseYear: r.releaseYear,
      runtime: r.runtime,
      watched: r.watched,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      prerequisiteIds: r.prerequisites.map((p: any) => p.prerequisiteMovieId),
      prerequisites: r.prerequisites.map((p: any) => ({
        id: p.prerequisite.id,
        title: p.prerequisite.title,
        releaseYear: p.prerequisite.releaseYear,
        runtime: p.prerequisite.runtime,
        watched: p.prerequisite.watched,
      })),
      dependents: r.dependents.map((d: any) => ({
        id: d.movie.id,
        title: d.movie.title,
      })),
    };
  }

  async getMovieByTitle(title: string): Promise<DbMovie | null> {
    const r = await this.client.movie.findFirst({
      where: { title: { equals: title.trim(), mode: 'insensitive' } },
      include: {
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
        dependents: {
          include: {
            movie: true,
          },
        },
      },
    });

    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      releaseYear: r.releaseYear,
      runtime: r.runtime,
      watched: r.watched,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      prerequisiteIds: r.prerequisites.map((p: any) => p.prerequisiteMovieId),
      prerequisites: r.prerequisites.map((p: any) => ({
        id: p.prerequisite.id,
        title: p.prerequisite.title,
        releaseYear: p.prerequisite.releaseYear,
        runtime: p.prerequisite.runtime,
        watched: p.prerequisite.watched,
      })),
      dependents: r.dependents.map((d: any) => ({
        id: d.movie.id,
        title: d.movie.title,
      })),
    };
  }

  async createMovie(data: {
    title: string;
    releaseYear: number;
    runtime: number;
    watched?: boolean;
    prerequisiteIds?: string[];
  }): Promise<DbMovie> {
    const created = await this.client.$transaction(async (tx: any) => {
      const movie = await tx.movie.create({
        data: {
          title: data.title.trim(),
          releaseYear: data.releaseYear,
          runtime: data.runtime,
          watched: data.watched ?? false,
        },
      });

      if (data.prerequisiteIds && data.prerequisiteIds.length > 0) {
        await tx.movieDependency.createMany({
          data: data.prerequisiteIds.map(prereqId => ({
            movieId: movie.id,
            prerequisiteMovieId: prereqId,
          })),
        });
      }

      return movie;
    });

    return (await this.getMovieById(created.id))!;
  }

  async updateMovie(
    id: string,
    data: {
      title?: string;
      releaseYear?: number;
      runtime?: number;
      watched?: boolean;
      prerequisiteIds?: string[];
    }
  ): Promise<DbMovie | null> {
    const updated = await this.client.$transaction(async (tx: any) => {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.releaseYear !== undefined) updateData.releaseYear = data.releaseYear;
      if (data.runtime !== undefined) updateData.runtime = data.runtime;
      if (data.watched !== undefined) updateData.watched = data.watched;

      const movie = await tx.movie.update({
        where: { id },
        data: updateData,
      });

      if (data.prerequisiteIds !== undefined) {
        // Delete existing and re-insert new
        await tx.movieDependency.deleteMany({
          where: { movieId: id },
        });

        if (data.prerequisiteIds.length > 0) {
          await tx.movieDependency.createMany({
            data: data.prerequisiteIds.map(prereqId => ({
              movieId: id,
              prerequisiteMovieId: prereqId,
            })),
          });
        }
      }

      return movie;
    });

    return await this.getMovieById(updated.id);
  }

  async deleteMovie(id: string): Promise<boolean> {
    try {
      await this.client.movie.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getAllCinemas(): Promise<DbCinema[]> {
    const cinemas = await this.client.cinema.findMany({
      include: { bundles: { orderBy: { bundleSize: 'asc' } } },
      orderBy: { name: 'asc' },
    });

    return cinemas.map((c: any) => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      bundles: c.bundles.map((b: any) => ({
        id: b.id,
        bundleSize: b.bundleSize,
      })),
    }));
  }

  async getCinemaById(id: string): Promise<DbCinema | null> {
    const c = await this.client.cinema.findUnique({
      where: { id },
      include: { bundles: { orderBy: { bundleSize: 'asc' } } },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      bundles: c.bundles.map((b: any) => ({
        id: b.id,
        bundleSize: b.bundleSize,
      })),
    };
  }

  async getCinemaByName(name: string): Promise<DbCinema | null> {
    const c = await this.client.cinema.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
      include: { bundles: { orderBy: { bundleSize: 'asc' } } },
    });
    if (!c) return null;
    return {
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      bundles: c.bundles.map((b: any) => ({
        id: b.id,
        bundleSize: b.bundleSize,
      })),
    };
  }

  async createCinema(data: { name: string; bundleSizes: number[] }): Promise<DbCinema> {
    const sortedSizes = Array.from(new Set(data.bundleSizes)).sort((a, b) => a - b);
    const created = await this.client.cinema.create({
      data: {
        name: data.name.trim(),
        bundles: {
          create: sortedSizes.map(size => ({ bundleSize: size })),
        },
      },
      include: { bundles: { orderBy: { bundleSize: 'asc' } } },
    });

    return {
      id: created.id,
      name: created.name,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      bundles: created.bundles.map((b: any) => ({
        id: b.id,
        bundleSize: b.bundleSize,
      })),
    };
  }

  async deleteCinema(id: string): Promise<boolean> {
    try {
      await this.client.cinema.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async seedIfEmpty(): Promise<void> {
    const movieCount = await this.client.movie.count();
    if (movieCount === 0) {
      const createdIds = new Map<string, string>();

      for (const m of SAMPLE_MOVIES_DATA) {
        const movie = await this.client.movie.create({
          data: {
            title: m.title,
            releaseYear: m.releaseYear,
            runtime: m.runtime,
            watched: m.watched,
          },
        });
        createdIds.set(m.title, movie.id);
      }

      for (const m of SAMPLE_MOVIES_DATA) {
        if (m.prerequisiteTitles.length > 0) {
          const movieId = createdIds.get(m.title)!;
          const prereqIds = m.prerequisiteTitles
            .map(t => createdIds.get(t))
            .filter((id): id is string => !!id);

          await this.client.movieDependency.createMany({
            data: prereqIds.map(prereqId => ({
              movieId,
              prerequisiteMovieId: prereqId,
            })),
          });
        }
      }
    }

    const cinemaCount = await this.client.cinema.count();
    if (cinemaCount === 0) {
      for (const c of SAMPLE_CINEMAS_DATA) {
        await this.createCinema(c);
      }
    }
  }

  async reset(): Promise<void> {
    await this.client.movieDependency.deleteMany({});
    await this.client.movie.deleteMany({});
    await this.client.cinemaBundle.deleteMany({});
    await this.client.cinema.deleteMany({});
  }
}

// -------------------------------------------------------------
// Database Instance Resolver
// -------------------------------------------------------------
let dbInstance: IDatabase | null = null;

export async function getDatabase(): Promise<IDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (ENV.STORAGE_MODE === 'memory') {
    dbInstance = new PersistentMemoryDatabase();
    await dbInstance.seedIfEmpty();
    return dbInstance;
  }

  if (ENV.STORAGE_MODE === 'prisma') {
    const prismaDb = new PrismaDatabase();
    dbInstance = prismaDb;
    await dbInstance.seedIfEmpty();
    return dbInstance;
  }

  // Auto-detect mode: Try Prisma, fallback seamlessly to persistent memory
  try {
    const prismaDb = new PrismaDatabase();
    // Test connection with a quick query
    await prismaDb.client.$queryRaw`SELECT 1`;
    dbInstance = prismaDb;
    await dbInstance.seedIfEmpty();
    return dbInstance;
  } catch {
    // If PostgreSQL server is not currently reachable, use PersistentMemoryDatabase
    dbInstance = new PersistentMemoryDatabase();
    await dbInstance.seedIfEmpty();
    return dbInstance;
  }
}
