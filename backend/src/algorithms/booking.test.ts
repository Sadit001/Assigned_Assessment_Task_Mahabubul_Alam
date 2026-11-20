import { describe, it, expect } from 'vitest';
import { calculateOptimalBooking } from './booking.js';

describe('Feature 2 Algorithm: Cinema Booking Optimizer (Dynamic Programming)', () => {
  describe('Assessment Test Cases', () => {
    it('TEST 5: Bundle sizes: 1, 3, 4 | Group size: 6 -> 2 bundles: 3 × 2', () => {
      const result = calculateOptimalBooking([1, 3, 4], 6);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(2);
      expect(result.totalSeats).toBe(6);
      expect(result.breakdown).toEqual([
        { bundleSize: 3, count: 2, subtotalSeats: 6 },
      ]);
      expect(result.summary).toBe('2 bundles: 3 × 2');
    });

    it('TEST 6: Bundle sizes: 2, 5 | Group size: 11 -> 4 bundles: 5 × 1, 2 × 3', () => {
      const result = calculateOptimalBooking([2, 5], 11);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(4);
      expect(result.totalSeats).toBe(11);
      expect(result.breakdown).toEqual([
        { bundleSize: 5, count: 1, subtotalSeats: 5 },
        { bundleSize: 2, count: 3, subtotalSeats: 6 },
      ]);
      expect(result.summary).toBe('4 bundles: 5 × 1, 2 × 3');
    });

    it('TEST 7: Bundle sizes: 6, 9, 20 | Group size: 44 -> 4 bundles: 20 × 1, 9 × 2, 6 × 1', () => {
      const result = calculateOptimalBooking([6, 9, 20], 44);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(4);
      expect(result.totalSeats).toBe(44);
      expect(result.breakdown).toEqual([
        { bundleSize: 20, count: 1, subtotalSeats: 20 },
        { bundleSize: 9, count: 2, subtotalSeats: 18 },
        { bundleSize: 6, count: 1, subtotalSeats: 6 },
      ]);
      expect(result.summary).toBe('4 bundles: 20 × 1, 9 × 2, 6 × 1');
    });

    it('TEST 8: Bundle sizes: 4, 6 | Group size: 7 -> NOT POSSIBLE', () => {
      const result = calculateOptimalBooking([4, 6], 7);

      expect(result.possible).toBe(false);
      expect(result.message).toBe('NOT POSSIBLE');
      expect(result.summary).toBe('Not possible');
      expect(result.totalBundles).toBeUndefined();
    });
  });

  describe('Edge Cases and Boundary Values', () => {
    it('handles exact single bundle match (e.g. group size 5 with bundle size 5)', () => {
      const result = calculateOptimalBooking([2, 5, 10], 5);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(1);
      expect(result.totalSeats).toBe(5);
      expect(result.summary).toBe('1 bundle: 5 × 1');
    });

    it('handles minimum group size = 1', () => {
      const resultPossible = calculateOptimalBooking([1, 5, 10], 1);
      expect(resultPossible.possible).toBe(true);
      expect(resultPossible.totalBundles).toBe(1);
      expect(resultPossible.summary).toBe('1 bundle: 1 × 1');

      const resultImpossible = calculateOptimalBooking([2, 5, 10], 1);
      expect(resultImpossible.possible).toBe(false);
      expect(resultImpossible.message).toBe('NOT POSSIBLE');
    });

    it('handles unsorted and duplicate bundle size input cleanly', () => {
      // Unsorted [20, 6, 9, 6, 20]
      const result = calculateOptimalBooking([20, 6, 9, 6, 20], 44);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(4);
      expect(result.totalSeats).toBe(44);
      expect(result.summary).toBe('4 bundles: 20 × 1, 9 × 2, 6 × 1');
    });

    it('finds absolute minimum bundles when greedy choice would fail', () => {
      // Greedy with [1, 15, 20] for target 30:
      // Greedy picks 20, remaining 10 -> ten 1s = 11 bundles.
      // DP finds 15 x 2 = 30 in only 2 bundles!
      const result = calculateOptimalBooking([1, 15, 20], 30);

      expect(result.possible).toBe(true);
      expect(result.totalBundles).toBe(2);
      expect(result.summary).toBe('2 bundles: 15 × 2');
    });

    it('handles maximum group size = 10,000 efficiently within milliseconds', () => {
      const startTime = performance.now();
      const result = calculateOptimalBooking([7, 13, 50, 100, 250, 500], 10000);
      const duration = performance.now() - startTime;

      expect(result.possible).toBe(true);
      expect(result.totalSeats).toBe(10000);
      expect(result.totalBundles).toBe(20); // 500 * 20
      expect(result.summary).toBe('20 bundles: 500 × 20');
      // Must execute well within standard API thresholds (< 50ms)
      expect(duration).toBeLessThan(50);
    });

    it('handles max 10 different bundle sizes up to 500 seats', () => {
      const bundles = [3, 7, 11, 23, 47, 89, 131, 251, 389, 499];
      const result = calculateOptimalBooking(bundles, 998);

      expect(result.possible).toBe(true);
      expect(result.totalSeats).toBe(998);
      expect(result.totalBundles).toBe(2); // 499 * 2
      expect(result.summary).toBe('2 bundles: 499 × 2');
    });

    it('rejects invalid group sizes (< 1 or > 10,000 or non-integer)', () => {
      expect(() => calculateOptimalBooking([5], 0)).toThrow();
      expect(() => calculateOptimalBooking([5], -10)).toThrow();
      expect(() => calculateOptimalBooking([5], 10001)).toThrow();
      expect(() => calculateOptimalBooking([5], 3.14)).toThrow();
    });
  });
});
