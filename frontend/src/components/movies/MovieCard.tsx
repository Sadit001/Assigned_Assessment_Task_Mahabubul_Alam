import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CheckCircle2, Circle, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { Movie } from '../../types';
import { Badge } from '../common/Badge';

export interface MovieCardProps {
  movie: Movie;
  onToggleWatched: (movie: Movie) => void;
  onEdit: (movie: Movie) => void;
  onDelete: (movie: Movie) => void;
  isToggling?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onToggleWatched,
  onEdit,
  onDelete,
  isToggling = false,
}) => {
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const formattedRuntime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-surface-card border transition-all duration-300 shadow-lg ${
        movie.watched
          ? 'border-emerald-500/25 bg-gradient-to-b from-surface-card to-emerald-950/10'
          : 'border-border-subtle hover:border-border-highlight'
      }`}
    >
      {/* Top Bar: Release Year, Runtime, Watched Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gold" />
              {movie.releaseYear}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              {formattedRuntime} ({movie.runtime}m)
            </span>
          </div>

          {/* Watched Toggle Pill */}
          <button
            onClick={() => onToggleWatched(movie)}
            disabled={isToggling}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              movie.watched
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-white/5 text-text-muted border border-border-subtle hover:bg-white/10 hover:text-white'
            }`}
            title={movie.watched ? 'Mark as unwatched' : 'Mark as watched'}
          >
            {movie.watched ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Watched</span>
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5" />
                <span>Unwatched</span>
              </>
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold font-display text-text-main group-hover:text-white transition-colors leading-snug mb-3">
          {movie.title}
        </h3>

        {/* Prerequisites Section */}
        <div className="space-y-1.5 pt-2 border-t border-border-subtle/50 text-xs">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted">
            Prerequisites ({movie.prerequisites?.length || movie.prerequisiteIds.length})
          </span>
          {movie.prerequisites && movie.prerequisites.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {movie.prerequisites.map(p => (
                <Badge
                  key={p.id}
                  variant={p.watched ? 'emerald' : 'slate'}
                  size="sm"
                  icon={p.watched ? <CheckCircle2 className="w-3 h-3" /> : undefined}
                >
                  {p.title}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-text-muted/60 italic text-xs">None (standalone watch)</p>
          )}
        </div>

        {/* Required for (dependents) */}
        {movie.dependents && movie.dependents.length > 0 && (
          <div className="space-y-1.5 pt-2 mt-2 border-t border-border-subtle/30 text-xs">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-text-muted flex items-center gap-1">
              Required for <ArrowRight className="w-3 h-3 text-crimson" />
            </span>
            <div className="flex flex-wrap gap-1.5">
              {movie.dependents.map(d => (
                <Badge key={d.id} variant="crimson" size="sm">
                  {d.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-border-subtle/40">
        <button
          onClick={() => onEdit(movie)}
          className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Edit movie & prerequisites"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(movie)}
          className="p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1 text-xs"
          title="Delete movie"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>
    </motion.div>
  );
};
