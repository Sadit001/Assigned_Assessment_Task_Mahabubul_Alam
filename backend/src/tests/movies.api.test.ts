import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { getDatabase } from '../config/database.js';

describe('Movies API Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    // Reset and seed database with sample assessment data
    const db = await getDatabase();
    await db.reset();
    await db.seedIfEmpty();
  });

  describe('GET /api/movies', () => {
    it('returns list of all seeded movies', async () => {
      const res = await request(app).get('/api/movies');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(8);

      const titles = res.body.map((m: any) => m.title);
      expect(titles).toContain('Iron Man');
      expect(titles).toContain('The Avengers');
      expect(titles).toContain('Avengers: Doomsday');
    });

    it('filters movies by search keyword', async () => {
      const res = await request(app).get('/api/movies?search=Avengers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(4); // The Avengers, Infinity War, Endgame, Doomsday
    });

    it('filters movies by watched status', async () => {
      const res = await request(app).get('/api/movies?watched=false');

      expect(res.status).toBe(200);
      expect(res.body.every((m: any) => m.watched === false)).toBe(true);
    });
  });

  describe('POST /api/movies', () => {
    it('creates a new movie successfully with valid data', async () => {
      const res = await request(app)
        .post('/api/movies')
        .send({
          title: 'Doctor Strange',
          releaseYear: 2016,
          runtime: 115,
          prerequisiteIds: [],
          watched: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Doctor Strange');
      expect(res.body.releaseYear).toBe(2016);
      expect(res.body.runtime).toBe(115);
      expect(res.body.watched).toBe(false);
      expect(res.body.id).toBeDefined();
    });

    it('rejects duplicate movie title with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/movies')
        .send({
          title: 'Iron Man', // already exists
          releaseYear: 2008,
          runtime: 126,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('DUPLICATE_TITLE');
    });

    it('rejects runtime outside 1-300 minutes with 400 Bad Request', async () => {
      const resZero = await request(app)
        .post('/api/movies')
        .send({
          title: 'Zero Runtime',
          releaseYear: 2020,
          runtime: 0,
        });
      expect(resZero.status).toBe(400);

      const resTooLong = await request(app)
        .post('/api/movies')
        .send({
          title: 'Overlong Movie',
          releaseYear: 2020,
          runtime: 305,
        });
      expect(resTooLong.status).toBe(400);
    });

    it('rejects nonexistent prerequisite IDs with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/movies')
        .send({
          title: 'Invalid Prereq Movie',
          releaseYear: 2024,
          runtime: 120,
          prerequisiteIds: ['non-existent-id-999'],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('BAD_REQUEST');
    });
  });

  describe('PATCH /api/movies/:id', () => {
    it('updates watched status successfully', async () => {
      const listRes = await request(app).get('/api/movies?search=Iron%20Man');
      const ironMan = listRes.body[0];

      const patchRes = await request(app)
        .patch(`/api/movies/${ironMan.id}`)
        .send({ watched: true });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.watched).toBe(true);

      // Verify persistence
      const verifyRes = await request(app).get(`/api/movies/${ironMan.id}`);
      expect(verifyRes.body.watched).toBe(true);
    });

    it('updates prerequisites successfully when acyclic', async () => {
      const listRes = await request(app).get('/api/movies');
      const thor = listRes.body.find((m: any) => m.title === 'Thor: Ragnarok');
      const ironMan = listRes.body.find((m: any) => m.title === 'Iron Man');

      const patchRes = await request(app)
        .patch(`/api/movies/${thor.id}`)
        .send({ prerequisiteIds: [ironMan.id] });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.prerequisiteIds).toContain(ironMan.id);
    });

    it('rejects self-dependency with 409 CIRCULAR_DEPENDENCY', async () => {
      const listRes = await request(app).get('/api/movies');
      const ironMan = listRes.body.find((m: any) => m.title === 'Iron Man');

      const patchRes = await request(app)
        .patch(`/api/movies/${ironMan.id}`)
        .send({ prerequisiteIds: [ironMan.id] });

      expect(patchRes.status).toBe(409);
      expect(patchRes.body.error).toBe('CIRCULAR_DEPENDENCY');
    });

    it('TEST 4: rejects making Avengers: Endgame a prerequisite of Iron Man with 409 CIRCULAR_DEPENDENCY', async () => {
      const listRes = await request(app).get('/api/movies');
      const ironMan = listRes.body.find((m: any) => m.title === 'Iron Man');
      const endgame = listRes.body.find((m: any) => m.title === 'Avengers: Endgame');

      const patchRes = await request(app)
        .patch(`/api/movies/${ironMan.id}`)
        .send({ prerequisiteIds: [endgame.id] });

      expect(patchRes.status).toBe(409);
      expect(patchRes.body.error).toBe('CIRCULAR_DEPENDENCY');
    });
  });

  describe('GET /api/movies/:id/rewatch-order', () => {
    it('TEST 1: returns valid rewatch order for Avengers: Doomsday (7 prerequisite movies)', async () => {
      const listRes = await request(app).get('/api/movies');
      const doomsday = listRes.body.find((m: any) => m.title === 'Avengers: Doomsday');

      const res = await request(app).get(`/api/movies/${doomsday.id}/rewatch-order`);

      expect(res.status).toBe(200);
      expect(res.body.targetMovie.title).toBe('Avengers: Doomsday');
      expect(res.body.totalMovies).toBe(7);

      const titles = res.body.movies.map((m: any) => m.title);
      expect(titles).not.toContain('Avengers: Doomsday');

      // Verify topological dependencies
      expect(titles.indexOf('Iron Man')).toBeLessThan(titles.indexOf('The Avengers'));
      expect(titles.indexOf('Captain America: The First Avenger')).toBeLessThan(titles.indexOf('The Avengers'));
      expect(titles.indexOf('The Avengers')).toBeLessThan(titles.indexOf('Captain America: Civil War'));
      expect(titles.indexOf('Captain America: Civil War')).toBeLessThan(titles.indexOf('Avengers: Infinity War'));
      expect(titles.indexOf('Thor: Ragnarok')).toBeLessThan(titles.indexOf('Avengers: Infinity War'));
      expect(titles.indexOf('Avengers: Infinity War')).toBeLessThan(titles.indexOf('Avengers: Endgame'));
    });

    it('TEST 2: returns valid rewatch order for Captain America: Civil War', async () => {
      const listRes = await request(app).get('/api/movies');
      const civilWar = listRes.body.find((m: any) => m.title === 'Captain America: Civil War');

      const res = await request(app).get(`/api/movies/${civilWar.id}/rewatch-order`);

      expect(res.status).toBe(200);
      expect(res.body.targetMovie.title).toBe('Captain America: Civil War');
      expect(res.body.totalMovies).toBe(3);

      const titles = res.body.movies.map((m: any) => m.title);
      expect(titles).toContain('Iron Man');
      expect(titles).toContain('Captain America: The First Avenger');
      expect(titles).toContain('The Avengers');
      expect(titles.indexOf('The Avengers')).toBeGreaterThan(titles.indexOf('Iron Man'));
    });

    it('TEST 3: returns empty list for Thor: Ragnarok', async () => {
      const listRes = await request(app).get('/api/movies');
      const ragnarok = listRes.body.find((m: any) => m.title === 'Thor: Ragnarok');

      const res = await request(app).get(`/api/movies/${ragnarok.id}/rewatch-order`);

      expect(res.status).toBe(200);
      expect(res.body.targetMovie.title).toBe('Thor: Ragnarok');
      expect(res.body.totalMovies).toBe(0);
      expect(res.body.movies).toEqual([]);
      expect(res.body.remainingRuntime).toBe(0);
    });
  });
});
