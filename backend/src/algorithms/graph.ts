/**
 * DOOMSDAY READY — Feature 1 Algorithm: Graph & Rewatch Order
 * 
 * Custom Graph Algorithm implementation for Movie Dependency Graph:
 * - Cycle Detection using Depth-First Search (DFS) with 3-color state tracking
 * - Transitive Closure (ancestor reachability)
 * - Topological Ordering on the prerequisite subgraph
 * - Calculation of watched counts and remaining unwatched runtime
 * 
 * NON-NEGOTIABLE RULE: Implemented purely with custom graph logic without
 * external graph or topological sorting libraries.
 */

export interface MovieNode {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  prerequisiteIds: string[];
}

export interface RewatchOrderResult {
  targetMovie: {
    id: string;
    title: string;
    releaseYear: number;
    runtime: number;
    watched: boolean;
  };
  movies: Array<{
    id: string;
    title: string;
    releaseYear: number;
    runtime: number;
    watched: boolean;
    prerequisiteIds: string[];
  }>;
  totalMovies: number;
  watchedCount: number;
  unwatchedCount: number;
  remainingRuntime: number;
}

export class CircularDependencyError extends Error {
  public readonly code = 'CIRCULAR_DEPENDENCY';
  public readonly cyclePath: string[];

  constructor(message: string, cyclePath: string[] = []) {
    super(message);
    this.name = 'CircularDependencyError';
    this.cyclePath = cyclePath;
    Object.setPrototypeOf(this, CircularDependencyError.prototype);
  }
}

/**
 * Validates whether introducing or updating a movie's prerequisites creates a cycle.
 * 
 * @param allMovies Array of all existing movies with their current prerequisites
 * @param movieId ID of the movie being created or updated
 * @param proposedPrerequisiteIds The new list of prerequisite IDs for this movie
 * @throws CircularDependencyError if a cycle is detected
 */
export function detectCycle(
  allMovies: Array<{ id: string; prerequisiteIds: string[] }>,
  movieId: string,
  proposedPrerequisiteIds: string[]
): void {
  // 1. Direct self-dependency check
  if (proposedPrerequisiteIds.includes(movieId)) {
    throw new CircularDependencyError(
      `Movie cannot depend on itself (movie ID: ${movieId})`,
      [movieId, movieId]
    );
  }

  // Build projected adjacency list:
  // Edge: dependent -> prerequisite
  // Meaning if M requires P, edge M -> P exists.
  const adj = new Map<string, string[]>();

  for (const m of allMovies) {
    if (m.id === movieId) {
      adj.set(m.id, [...proposedPrerequisiteIds]);
    } else {
      adj.set(m.id, [...m.prerequisiteIds]);
    }
  }

  // Ensure target movie is in adjacency map even if creating new
  if (!adj.has(movieId)) {
    adj.set(movieId, [...proposedPrerequisiteIds]);
  }

  // 3-color DFS state:
  // 0 = UNVISITED, 1 = VISITING (in current recursion path), 2 = VISITED
  const color = new Map<string, number>();
  const parent = new Map<string, string | null>();
  let detectedCycle: string[] | null = null;

  for (const key of adj.keys()) {
    color.set(key, 0);
  }

  function dfs(u: string, path: string[]): boolean {
    color.set(u, 1);
    path.push(u);

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      const neighborColor = color.get(v) ?? 0;

      if (neighborColor === 1) {
        // Cycle found! Reconstruct cycle path from v onwards
        const cycleStartIndex = path.indexOf(v);
        detectedCycle = cycleStartIndex !== -1 ? path.slice(cycleStartIndex).concat(v) : [u, v];
        return true;
      }

      if (neighborColor === 0) {
        parent.set(v, u);
        if (dfs(v, path)) {
          return true;
        }
      }
    }

    path.pop();
    color.set(u, 2);
    return false;
  }

  // Check from the updated/created movie first for early detection
  if (dfs(movieId, [])) {
    const cycle = detectedCycle as string[] | null;
    throw new CircularDependencyError(
      `Circular dependency detected: ${cycle ? cycle.join(' -> ') : 'cycle detected'}`,
      cycle || []
    );
  }

  // Check any remaining components in the graph
  for (const node of adj.keys()) {
    if ((color.get(node) ?? 0) === 0) {
      if (dfs(node, [])) {
        const cycle = detectedCycle as string[] | null;
        throw new CircularDependencyError(
          `Circular dependency detected: ${cycle ? cycle.join(' -> ') : 'cycle detected'}`,
          cycle || []
        );
      }
    }
  }
}

/**
 * Computes the valid rewatch order for a target movie.
 * 
 * Rules:
 * 1. Find all direct and indirect prerequisites (transitive closure).
 * 2. Exclude the target movie itself.
 * 3. Each prerequisite appears exactly once.
 * 4. Every prerequisite appears before any movie that depends on it.
 * 5. Return watched/unwatched counts and remaining unwatched runtime.
 * 
 * @param targetMovieId ID of target movie
 * @param allMovies Array of all movies in database
 */
export function computeRewatchOrder(
  targetMovieId: string,
  allMovies: MovieNode[]
): RewatchOrderResult {
  const movieMap = new Map<string, MovieNode>();
  for (const m of allMovies) {
    movieMap.set(m.id, m);
  }

  const target = movieMap.get(targetMovieId);
  if (!target) {
    throw new Error(`Target movie with ID ${targetMovieId} not found`);
  }

  // Step 1: Collect transitive prerequisites of targetMovieId (ancestors)
  // DFS traversal collecting all reachable prerequisites
  const prerequisiteSet = new Set<string>();
  const visited = new Set<string>();

  function collectPrerequisites(currId: string) {
    const movie = movieMap.get(currId);
    if (!movie) return;

    for (const prereqId of movie.prerequisiteIds) {
      prerequisiteSet.add(prereqId);
      if (!visited.has(prereqId)) {
        visited.add(prereqId);
        collectPrerequisites(prereqId);
      }
    }
  }

  collectPrerequisites(targetMovieId);

  // If no prerequisites, return empty list
  if (prerequisiteSet.size === 0) {
    return {
      targetMovie: {
        id: target.id,
        title: target.title,
        releaseYear: target.releaseYear,
        runtime: target.runtime,
        watched: target.watched,
      },
      movies: [],
      totalMovies: 0,
      watchedCount: 0,
      unwatchedCount: 0,
      remainingRuntime: 0,
    };
  }

  // Step 2: Build induced subgraph for topological ordering
  // Edge direction for watch order:
  // If A is prerequisite of B (A must be watched BEFORE B), then edge is A -> B.
  // In-degree(B): number of prerequisites of B that are inside prerequisiteSet.
  const inDegree = new Map<string, number>();
  const dependentsMap = new Map<string, string[]>(); // A -> list of movies in prerequisiteSet that depend on A

  for (const id of prerequisiteSet) {
    inDegree.set(id, 0);
    dependentsMap.set(id, []);
  }

  for (const id of prerequisiteSet) {
    const movie = movieMap.get(id);
    if (!movie) continue;

    for (const prereqId of movie.prerequisiteIds) {
      if (prerequisiteSet.has(prereqId)) {
        // prereqId must come before id
        dependentsMap.get(prereqId)!.push(id);
        inDegree.set(id, (inDegree.get(id) || 0) + 1);
      }
    }
  }

  // Step 3: Kahn's Algorithm for Topological Sort
  // To ensure deterministic, pleasant ordering when movies are independent,
  // we sort available nodes with in-degree 0 by releaseYear ascending, then title ascending.
  const readyQueue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      readyQueue.push(id);
    }
  }

  const sortedMovieIds: string[] = [];

  while (readyQueue.length > 0) {
    // Sort ready queue deterministically by release year, then title
    readyQueue.sort((a, b) => {
      const mA = movieMap.get(a)!;
      const mB = movieMap.get(b)!;
      if (mA.releaseYear !== mB.releaseYear) {
        return mA.releaseYear - mB.releaseYear;
      }
      return mA.title.localeCompare(mB.title);
    });

    const currId = readyQueue.shift()!;
    sortedMovieIds.push(currId);

    const dependents = dependentsMap.get(currId) || [];
    for (const depId of dependents) {
      const newDeg = (inDegree.get(depId) || 1) - 1;
      inDegree.set(depId, newDeg);
      if (newDeg === 0) {
        readyQueue.push(depId);
      }
    }
  }

  // Sanity check: Ensure all collected prerequisites were ordered (no cycle in ancestors)
  if (sortedMovieIds.length !== prerequisiteSet.size) {
    throw new CircularDependencyError('Cycle detected within prerequisite subgraph');
  }

  // Step 4: Map sorted IDs to full movie objects and calculate stats
  const orderedMovies = sortedMovieIds.map(id => {
    const m = movieMap.get(id)!;
    return {
      id: m.id,
      title: m.title,
      releaseYear: m.releaseYear,
      runtime: m.runtime,
      watched: m.watched,
      prerequisiteIds: m.prerequisiteIds,
    };
  });

  const totalMovies = orderedMovies.length;
  const watchedCount = orderedMovies.filter(m => m.watched).length;
  const unwatchedCount = totalMovies - watchedCount;
  const remainingRuntime = orderedMovies
    .filter(m => !m.watched)
    .reduce((sum, m) => sum + m.runtime, 0);

  return {
    targetMovie: {
      id: target.id,
      title: target.title,
      releaseYear: target.releaseYear,
      runtime: target.runtime,
      watched: target.watched,
    },
    movies: orderedMovies,
    totalMovies,
    watchedCount,
    unwatchedCount,
    remainingRuntime,
  };
}
