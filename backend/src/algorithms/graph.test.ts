import { describe, it, expect } from 'vitest';
import {
  detectCycle,
  computeRewatchOrder,
  CircularDependencyError,
  MovieNode,
} from './graph.js';

describe('Feature 1 Algorithm: Graph and Rewatch Order', () => {
  // Assessment Sample Data:
  // Iron Man: None
  // Captain America: The First Avenger: None
  // The Avengers: Iron Man, Captain America: The First Avenger
  // Captain America: Civil War: The Avengers
  // Thor: Ragnarok: None
  // Avengers: Infinity War: Captain America: Civil War, Thor: Ragnarok
  // Avengers: Endgame: Avengers: Infinity War
  // Avengers: Doomsday: Avengers: Endgame
  const sampleMovies: MovieNode[] = [
    {
      id: 'm1',
      title: 'Iron Man',
      releaseYear: 2008,
      runtime: 126,
      watched: true,
      prerequisiteIds: [],
    },
    {
      id: 'm2',
      title: 'Captain America: The First Avenger',
      releaseYear: 2011,
      runtime: 124,
      watched: true,
      prerequisiteIds: [],
    },
    {
      id: 'm3',
      title: 'The Avengers',
      releaseYear: 2012,
      runtime: 143,
      watched: true,
      prerequisiteIds: ['m1', 'm2'],
    },
    {
      id: 'm4',
      title: 'Captain America: Civil War',
      releaseYear: 2016,
      runtime: 147,
      watched: false,
      prerequisiteIds: ['m3'],
    },
    {
      id: 'm5',
      title: 'Thor: Ragnarok',
      releaseYear: 2017,
      runtime: 130,
      watched: false,
      prerequisiteIds: [],
    },
    {
      id: 'm6',
      title: 'Avengers: Infinity War',
      releaseYear: 2018,
      runtime: 149,
      watched: false,
      prerequisiteIds: ['m4', 'm5'],
    },
    {
      id: 'm7',
      title: 'Avengers: Endgame',
      releaseYear: 2019,
      runtime: 181,
      watched: false,
      prerequisiteIds: ['m6'],
    },
    {
      id: 'm8',
      title: 'Avengers: Doomsday',
      releaseYear: 2026,
      runtime: 180,
      watched: false,
      prerequisiteIds: ['m7'],
    },
  ];

  describe('Cycle Detection (DFS)', () => {
    it('allows valid acyclic prerequisite additions', () => {
      expect(() => {
        detectCycle(sampleMovies, 'm8', ['m7']);
      }).not.toThrow();
    });

    it('rejects direct self-dependency with CircularDependencyError', () => {
      expect(() => {
        detectCycle(sampleMovies, 'm1', ['m1']);
      }).toThrow(CircularDependencyError);
    });

    it('rejects direct 2-node cycle: A -> B -> A', () => {
      // m3 requires m1. Attempting to make m1 require m3.
      expect(() => {
        detectCycle(sampleMovies, 'm1', ['m3']);
      }).toThrow(CircularDependencyError);
    });

    it('rejects indirect multi-hop cycle (TEST 4 from Assessment: Make Endgame a prerequisite of Iron Man)', () => {
      // Path: m1 -> m3 -> m4 -> m6 -> m7. Adding m7 as prereq of m1 makes a cycle.
      expect(() => {
        detectCycle(sampleMovies, 'm1', ['m7']);
      }).toThrow(CircularDependencyError);

      try {
        detectCycle(sampleMovies, 'm1', ['m7']);
      } catch (err) {
        expect(err).toBeInstanceOf(CircularDependencyError);
        expect((err as CircularDependencyError).code).toBe('CIRCULAR_DEPENDENCY');
      }
    });

    it('rejects deep 4-node circular dependency when creating a new movie', () => {
      // Existing: A -> B -> C. New node D requires C. Then updating A to require D.
      const movies = [
        { id: 'A', prerequisiteIds: ['B'] },
        { id: 'B', prerequisiteIds: ['C'] },
        { id: 'C', prerequisiteIds: [] },
      ];
      // Making C require A
      expect(() => {
        detectCycle(movies, 'C', ['A']);
      }).toThrow(CircularDependencyError);
    });
  });

  describe('Rewatch Order (Topological Ordering)', () => {
    it('TEST 1: correctly computes rewatch order for Avengers: Doomsday (7 prerequisite movies)', () => {
      const result = computeRewatchOrder('m8', sampleMovies);

      expect(result.targetMovie.title).toBe('Avengers: Doomsday');
      expect(result.totalMovies).toBe(7);
      expect(result.movies.map(m => m.title)).not.toContain('Avengers: Doomsday');

      // Valid order verification: every prerequisite must appear before its dependents
      const titleOrder = result.movies.map(m => m.title);

      const posIronMan = titleOrder.indexOf('Iron Man');
      const posFirstAvenger = titleOrder.indexOf('Captain America: The First Avenger');
      const posTheAvengers = titleOrder.indexOf('The Avengers');
      const posCivilWar = titleOrder.indexOf('Captain America: Civil War');
      const posRagnarok = titleOrder.indexOf('Thor: Ragnarok');
      const posInfinityWar = titleOrder.indexOf('Avengers: Infinity War');
      const posEndgame = titleOrder.indexOf('Avengers: Endgame');

      expect(posIronMan).toBeLessThan(posTheAvengers);
      expect(posFirstAvenger).toBeLessThan(posTheAvengers);
      expect(posTheAvengers).toBeLessThan(posCivilWar);
      expect(posCivilWar).toBeLessThan(posInfinityWar);
      expect(posRagnarok).toBeLessThan(posInfinityWar);
      expect(posInfinityWar).toBeLessThan(posEndgame);

      // Watched statistics:
      // m1 (126m, watched: true)
      // m2 (124m, watched: true)
      // m3 (143m, watched: true)
      // m4 (147m, watched: false)
      // m5 (130m, watched: false)
      // m6 (149m, watched: false)
      // m7 (181m, watched: false)
      expect(result.watchedCount).toBe(3);
      expect(result.unwatchedCount).toBe(4);
      expect(result.remainingRuntime).toBe(147 + 130 + 149 + 181); // 607 minutes
    });

    it('TEST 2: correctly computes rewatch order for Captain America: Civil War', () => {
      const result = computeRewatchOrder('m4', sampleMovies);

      expect(result.targetMovie.title).toBe('Captain America: Civil War');
      expect(result.totalMovies).toBe(3);

      const titles = result.movies.map(m => m.title);
      expect(titles).toContain('Iron Man');
      expect(titles).toContain('Captain America: The First Avenger');
      expect(titles).toContain('The Avengers');
      expect(titles).not.toContain('Captain America: Civil War');

      // The Avengers must come after Iron Man and First Avenger
      const posIronMan = titles.indexOf('Iron Man');
      const posFirstAvenger = titles.indexOf('Captain America: The First Avenger');
      const posTheAvengers = titles.indexOf('The Avengers');

      expect(posIronMan).toBeLessThan(posTheAvengers);
      expect(posFirstAvenger).toBeLessThan(posTheAvengers);
    });

    it('TEST 3: correctly returns empty list for Thor: Ragnarok (no prerequisites)', () => {
      const result = computeRewatchOrder('m5', sampleMovies);

      expect(result.targetMovie.title).toBe('Thor: Ragnarok');
      expect(result.totalMovies).toBe(0);
      expect(result.movies).toEqual([]);
      expect(result.watchedCount).toBe(0);
      expect(result.unwatchedCount).toBe(0);
      expect(result.remainingRuntime).toBe(0);
    });

    it('handles diamond dependencies without duplicates', () => {
      // Diamond: D depends on B and C; B and C both depend on A.
      const diamondMovies: MovieNode[] = [
        { id: 'A', title: 'Movie A', releaseYear: 2020, runtime: 100, watched: true, prerequisiteIds: [] },
        { id: 'B', title: 'Movie B', releaseYear: 2021, runtime: 100, watched: false, prerequisiteIds: ['A'] },
        { id: 'C', title: 'Movie C', releaseYear: 2022, runtime: 100, watched: true, prerequisiteIds: ['A'] },
        { id: 'D', title: 'Movie D', releaseYear: 2023, runtime: 100, watched: false, prerequisiteIds: ['B', 'C'] },
      ];

      const result = computeRewatchOrder('D', diamondMovies);
      expect(result.totalMovies).toBe(3);
      expect(result.movies.map(m => m.id)).toEqual(['A', 'B', 'C']);
      // Movie A appears exactly once
      expect(result.movies.filter(m => m.id === 'A').length).toBe(1);
      expect(result.remainingRuntime).toBe(100); // only B is unwatched
    });
  });
});
