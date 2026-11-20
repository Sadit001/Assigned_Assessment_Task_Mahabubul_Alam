import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { getDatabase } from '../config/database.js';

describe('Cinemas API Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    const db = await getDatabase();
    await db.reset();
    await db.seedIfEmpty();
  });

  describe('GET /api/cinemas', () => {
    it('returns list of seeded cinemas with their bundle sizes', async () => {
      const res = await request(app).get('/api/cinemas');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);

      const names = res.body.map((c: any) => c.name);
      expect(names).toContain('Stark Starkplex IMAX');
      expect(names).toContain('Wakanda Grand Cinema');
      expect(names).toContain('Sanctum Sanctorum Theatres');
      expect(names).toContain('Quantum Realm Odeon');
    });
  });

  describe('POST /api/cinemas', () => {
    it('creates cinema successfully with valid bundle sizes', async () => {
      const res = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Asgardian Palace Cinema',
          bundleSizes: [5, 10, 25],
        });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Asgardian Palace Cinema');
      expect(res.body.bundles.map((b: any) => b.bundleSize)).toEqual([5, 10, 25]);
    });

    it('rejects duplicate cinema name with 409 Conflict', async () => {
      const res = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Stark Starkplex IMAX',
          bundleSizes: [2, 4],
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('DUPLICATE_CINEMA_NAME');
    });

    it('rejects empty bundle sizes or more than 10 bundle sizes', async () => {
      const resEmpty = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Empty Bundles',
          bundleSizes: [],
        });
      expect(resEmpty.status).toBe(400);

      const resTooMany = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Too Many Bundles',
          bundleSizes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        });
      expect(resTooMany.status).toBe(400);
    });

    it('rejects duplicate bundle sizes within the same cinema', async () => {
      const res = await request(app)
        .post('/api/cinemas')
        .send({
          name: 'Duplicate Bundle Cinema',
          bundleSizes: [5, 10, 5],
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/cinemas/:id/booking?groupSize=X (Assessment Tests)', () => {
    it('TEST 5: Starkplex (1, 3, 4) with group size 6 -> 2 bundles: 3 × 2', async () => {
      const listRes = await request(app).get('/api/cinemas');
      const cinema = listRes.body.find((c: any) => c.name === 'Stark Starkplex IMAX');

      const res = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=6`);

      expect(res.status).toBe(200);
      expect(res.body.possible).toBe(true);
      expect(res.body.totalBundles).toBe(2);
      expect(res.body.totalSeats).toBe(6);
      expect(res.body.summary).toBe('2 bundles: 3 × 2');
    });

    it('TEST 6: Wakanda Grand (2, 5) with group size 11 -> 4 bundles: 5 × 1, 2 × 3', async () => {
      const listRes = await request(app).get('/api/cinemas');
      const cinema = listRes.body.find((c: any) => c.name === 'Wakanda Grand Cinema');

      const res = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=11`);

      expect(res.status).toBe(200);
      expect(res.body.possible).toBe(true);
      expect(res.body.totalBundles).toBe(4);
      expect(res.body.totalSeats).toBe(11);
      expect(res.body.summary).toBe('4 bundles: 5 × 1, 2 × 3');
    });

    it('TEST 7: Sanctum Sanctorum (6, 9, 20) with group size 44 -> 4 bundles: 20 × 1, 9 × 2, 6 × 1', async () => {
      const listRes = await request(app).get('/api/cinemas');
      const cinema = listRes.body.find((c: any) => c.name === 'Sanctum Sanctorum Theatres');

      const res = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=44`);

      expect(res.status).toBe(200);
      expect(res.body.possible).toBe(true);
      expect(res.body.totalBundles).toBe(4);
      expect(res.body.totalSeats).toBe(44);
      expect(res.body.summary).toBe('4 bundles: 20 × 1, 9 × 2, 6 × 1');
    });

    it('TEST 8: Quantum Realm (4, 6) with group size 7 -> NOT POSSIBLE', async () => {
      const listRes = await request(app).get('/api/cinemas');
      const cinema = listRes.body.find((c: any) => c.name === 'Quantum Realm Odeon');

      const res = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=7`);

      expect(res.status).toBe(200);
      expect(res.body.possible).toBe(false);
      expect(res.body.message).toBe('NOT POSSIBLE');
      expect(res.body.summary).toBe('Not possible');
    });

    it('rejects group sizes outside 1 to 10,000 with 400 Bad Request', async () => {
      const listRes = await request(app).get('/api/cinemas');
      const cinema = listRes.body[0];

      const resNegative = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=-1`);
      expect(resNegative.status).toBe(400);

      const resTooBig = await request(app).get(`/api/cinemas/${cinema.id}/booking?groupSize=10001`);
      expect(resTooBig.status).toBe(400);
    });
  });
});
