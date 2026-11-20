import React from 'react';
import { Target, ChevronDown } from 'lucide-react';
import { Movie } from '../../types';

export interface TargetSelectorProps {
  movies: Movie[];
  selectedMovieId: string | null;
  onSelect: (movieId: string) => void;
  isLoading?: boolean;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  movies,
  selectedMovieId,
  onSelect,
  isLoading = false,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-cinematic">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gold flex items-center gap-1.5 mb-1">
            <Target className="w-4 h-4 text-crimson" />
            Rewatch Target Selection
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-display text-text-main">
            Select Your Destination Movie
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Choose a movie to generate its exact, dependency-respecting rewatch roadmap.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="relative min-w-[280px]">
          <select
            value={selectedMovieId || ''}
            onChange={e => onSelect(e.target.value)}
            disabled={isLoading || movies.length === 0}
            className="w-full appearance-none px-4 py-3 bg-surface-dark border border-border-highlight rounded-xl text-text-main text-sm font-medium focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson transition-all cursor-pointer disabled:opacity-50"
          >
            <option value="" disabled>
              Select a target movie...
            </option>
            {movies.map(m => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.releaseYear}) {m.title.includes('Doomsday') ? '★ RECOMMENDED' : ''}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
