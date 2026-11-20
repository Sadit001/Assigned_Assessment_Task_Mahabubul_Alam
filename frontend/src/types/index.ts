export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtime: number;
  watched: boolean;
  createdAt: string;
  updatedAt: string;
  prerequisiteIds: string[];
  prerequisites?: Array<{
    id: string;
    title: string;
    releaseYear: number;
    runtime: number;
    watched: boolean;
  }>;
  dependents?: Array<{
    id: string;
    title: string;
  }>;
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

export interface CinemaBundle {
  id: string;
  bundleSize: number;
}

export interface Cinema {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  bundles: CinemaBundle[];
}

export interface BundleBreakdownItem {
  bundleSize: number;
  count: number;
  subtotalSeats: number;
}

export interface BookingQuoteResult {
  possible: boolean;
  cinema: {
    id: string;
    name: string;
  };
  groupSize: number;
  totalBundles?: number;
  totalSeats?: number;
  breakdown?: BundleBreakdownItem[];
  summary: string;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  cyclePath?: string[];
  details?: Array<{ field: string; message: string }>;
}
