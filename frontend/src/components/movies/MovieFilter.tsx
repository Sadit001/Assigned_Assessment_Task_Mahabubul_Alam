import React from 'react';
import { Search, Plus, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../common/Button';

export interface MovieFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  watchedFilter: 'all' | 'watched' | 'unwatched';
  onWatchedFilterChange: (filter: 'all' | 'watched' | 'unwatched') => void;
  onAddMovie: () => void;
  totalCount: number;
}

export const MovieFilter: React.FC<MovieFilterProps> = ({
  search,
  onSearchChange,
  watchedFilter,
  onWatchedFilterChange,
  onAddMovie,
  totalCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-dark border border-border-subtle">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={`Search ${totalCount} movies by title...`}
          className="w-full pl-10 pr-4 py-2 bg-surface-card border border-border-subtle rounded-xl text-text-main text-sm placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-text-muted hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs & Add Button */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-between md:justify-end">
        {/* Watched State Filter Pills */}
        <div className="flex items-center p-1 rounded-xl bg-surface-card border border-border-subtle text-xs">
          <button
            onClick={() => onWatchedFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              watchedFilter === 'all'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-text-muted hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onWatchedFilterChange('watched')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              watchedFilter === 'watched'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Watched</span>
          </button>
          <button
            onClick={() => onWatchedFilterChange('unwatched')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium ${
              watchedFilter === 'unwatched'
                ? 'bg-crimson/20 text-crimson-hover border border-crimson/30'
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            <span>Unwatched</span>
          </button>
        </div>

        {/* Add Movie CTA Button */}
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={onAddMovie}>
          Add Movie
        </Button>
      </div>
    </div>
  );
};
