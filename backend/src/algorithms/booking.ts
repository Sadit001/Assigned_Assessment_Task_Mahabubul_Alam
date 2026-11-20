/**
 * DOOMSDAY READY — Feature 2 Algorithm: Cinema Booking Optimizer
 * 
 * Custom Dynamic Programming implementation for Minimum-Bundle watch-party seat calculation:
 * - Given available bundle sizes and a requested group size (1 to 10,000)
 * - Finds the minimum total number of bundles that sum to EXACTLY the group size
 * - Reconstructs the count of each bundle size used
 * - Detects impossible combinations (e.g. 7 seats with bundle sizes 4 and 6)
 * - Handles duplicate bundle sizes, unsorted inputs, boundary group sizes
 * 
 * NON-NEGOTIABLE RULE: Implemented purely with custom Dynamic Programming without
 * external coin-change or optimization libraries.
 */

export interface BundleBreakdown {
  bundleSize: number;
  count: number;
  subtotalSeats: number;
}

export interface BookingResult {
  possible: boolean;
  groupSize: number;
  totalBundles?: number;
  totalSeats?: number;
  breakdown?: BundleBreakdown[];
  summary: string;
  message?: string;
}

/**
 * Optimizes opening-night cinema bundle selection using bottom-up Dynamic Programming.
 * 
 * @param bundleSizes Array of bundle sizes available at the cinema (e.g. [1, 3, 4] or [6, 9, 20])
 * @param groupSize Requested total group size (1 to 10,000)
 * @returns BookingResult with minimum bundle combination or impossible result
 */
export function calculateOptimalBooking(
  bundleSizes: number[],
  groupSize: number
): BookingResult {
  // Validate input constraints
  if (!Number.isInteger(groupSize) || groupSize < 1 || groupSize > 10000) {
    throw new Error('Group size must be an integer between 1 and 10,000');
  }

  // Sanitize bundle sizes: positive unique integers
  const uniqueSizes = Array.from(new Set(bundleSizes))
    .filter(b => Number.isInteger(b) && b > 0 && b <= 500)
    .sort((a, b) => a - b);

  if (uniqueSizes.length === 0) {
    return {
      possible: false,
      groupSize,
      message: 'NOT POSSIBLE',
      summary: 'Not possible (no valid bundle sizes available)',
    };
  }

  // Dynamic Programming Formulation:
  // dp[i] = minimum number of bundles needed to form exactly i seats.
  // parent[i] = the bundle size chosen to transition to state i.
  // We use 32-bit typed arrays for maximum cache locality and performance.
  const INF = 1_000_000_000;
  const dp = new Int32Array(groupSize + 1);
  const parent = new Int32Array(groupSize + 1);

  dp.fill(INF);
  parent.fill(-1);

  // Base case: 0 seats require 0 bundles
  dp[0] = 0;

  // Bottom-up DP: compute optimal bundles for every seat count up to groupSize
  for (let i = 1; i <= groupSize; i++) {
    for (let j = 0; j < uniqueSizes.length; j++) {
      const b = uniqueSizes[j];
      if (b <= i) {
        const prev = dp[i - b];
        if (prev !== INF) {
          const candidateBundles = prev + 1;
          if (candidateBundles < dp[i]) {
            dp[i] = candidateBundles;
            parent[i] = b;
          }
        }
      } else {
        // Since uniqueSizes is sorted ascending, no further bundle can be <= i
        break;
      }
    }
  }

  // If dp[groupSize] is still INF, no exact combination exists
  if (dp[groupSize] === INF) {
    return {
      possible: false,
      groupSize,
      message: 'NOT POSSIBLE',
      summary: 'Not possible',
    };
  }

  // Traceback to reconstruct the exact count of each bundle size used
  const bundleCounts = new Map<number, number>();
  let current = groupSize;

  while (current > 0) {
    const chosenBundle = parent[current];
    if (chosenBundle === -1) {
      break;
    }
    bundleCounts.set(chosenBundle, (bundleCounts.get(chosenBundle) || 0) + 1);
    current -= chosenBundle;
  }

  // Construct breakdown sorted descending by bundle size (e.g. 20 x 1, 9 x 2, 6 x 1)
  const breakdown: BundleBreakdown[] = Array.from(bundleCounts.entries())
    .map(([bundleSize, count]) => ({
      bundleSize,
      count,
      subtotalSeats: bundleSize * count,
    }))
    .sort((a, b) => b.bundleSize - a.bundleSize);

  const totalBundles = dp[groupSize];
  const totalSeats = breakdown.reduce((sum, item) => sum + item.subtotalSeats, 0);

  // Format concise readable summary string matching assessment format:
  // e.g. "4 bundles: 20 × 1, 9 × 2, 6 × 1" or "2 bundles: 3 × 2"
  const breakdownStr = breakdown
    .map(b => `${b.bundleSize} × ${b.count}`)
    .join(', ');
  const bundleLabel = totalBundles === 1 ? 'bundle' : 'bundles';
  const summary = `${totalBundles} ${bundleLabel}: ${breakdownStr}`;

  return {
    possible: true,
    groupSize,
    totalBundles,
    totalSeats,
    breakdown,
    summary,
  };
}
