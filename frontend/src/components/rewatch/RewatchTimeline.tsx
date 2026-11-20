import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Calendar, Sparkles, Check, Flag } from 'lucide-react';
import { RewatchOrderResult, Movie } from '../../types';

export interface RewatchTimelineProps {
  orderResult: RewatchOrderResult;
  onToggleWatched: (movie: Movie) => void;
  isTogglingId?: string | null;
}

export const RewatchTimeline: React.FC<RewatchTimelineProps> = ({
  orderResult,
  onToggleWatched,
  isTogglingId,
}) => {
  const { movies, targetMovie, totalMovies } = orderResult;

  if (totalMovies === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
          <Sparkles className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-lg font-bold font-display text-text-main">
            Standalone Experience
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            "{targetMovie.title}" does not require any prior MCU movies! You can watch it directly without catching up on earlier prerequisites.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between text-xs text-text-muted px-2">
        <span className="font-semibold uppercase tracking-wider text-text-muted">
          Chronological Watch Order ({totalMovies} Movies)
        </span>
        <span>Every movie appears after all its prerequisites</span>
      </div>

      {/* Sequential Timeline Nodes */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-crimson before:via-gold before:to-emerald-500">
        {movies.map((movie, index) => {
          const isToggling = isTogglingId === movie.id;
          const hours = Math.floor(movie.runtime / 60);
          const minutes = movie.runtime % 60;
          const formattedRuntime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="relative group"
            >
              {/* Timeline Marker (Step Number) */}
              <div
                className={`absolute -left-6 sm:-left-8 top-4 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                  movie.watched
                    ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30'
                    : 'bg-surface-card border-crimson text-text-main shadow-crimson-glow'
                }`}
              >
                {movie.watched ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : index + 1}
              </div>

              {/* Movie Card */}
              <div
                className={`p-4 sm:p-5 rounded-2xl bg-surface-card border transition-all duration-200 ${
                  movie.watched
                    ? 'border-emerald-500/25 bg-surface-card/60'
                    : 'border-border-subtle hover:border-border-highlight bg-surface-card'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-gold">
                        Step #{index + 1}
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gold" />
                        {movie.releaseYear}
                      </span>
                      <span className="text-text-muted">•</span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedRuntime}
                      </span>
                    </div>

                    <h4
                      className={`text-base sm:text-lg font-bold font-display transition-colors ${
                        movie.watched ? 'text-emerald-300 line-through/20' : 'text-text-main'
                      }`}
                    >
                      {movie.title}
                    </h4>
                  </div>

                  {/* Watched Action Button */}
                  <button
                    onClick={() =>
                      onToggleWatched({
                        id: movie.id,
                        title: movie.title,
                        releaseYear: movie.releaseYear,
                        runtime: movie.runtime,
                        watched: movie.watched,
                        createdAt: '',
                        updatedAt: '',
                        prerequisiteIds: movie.prerequisiteIds,
                      })
                    }
                    disabled={isToggling}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 select-none ${
                      movie.watched
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                        : 'bg-white/5 text-text-muted border border-border-subtle hover:border-crimson hover:text-white'
                    }`}
                  >
                    {movie.watched ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 text-text-muted" />
                        <span>Mark Watched</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Final Target Destination Node */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: totalMovies * 0.05 + 0.1 }}
          className="relative group pt-2"
        >
          {/* Finish Line Marker */}
          <div className="absolute -left-6 sm:-left-8 top-6 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gold border border-gold text-black flex items-center justify-center font-bold shadow-gold-glow">
            <Flag className="w-3.5 h-3.5 fill-black" />
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-card via-surface-dark to-surface-card border-2 border-gold/40 shadow-cinematic">
            <div className="flex items-center gap-2 text-xs text-gold font-bold uppercase tracking-wider mb-1">
              <span>Premiere Destination</span>
              <span>★</span>
              <span>The Target Film</span>
            </div>
            <h4 className="text-xl font-black font-display text-text-main flex items-center gap-2">
              {targetMovie.title}
              <span className="text-xs px-2 py-0.5 rounded bg-crimson text-white font-sans font-semibold">
                {targetMovie.releaseYear}
              </span>
            </h4>
            <p className="text-xs text-text-muted mt-1">
              Once you complete all {totalMovies} prerequisite movies above in order, you are fully ready to experience {targetMovie.title}!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
