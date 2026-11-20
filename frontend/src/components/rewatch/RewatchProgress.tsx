import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface RewatchProgressProps {
  totalMovies: number;
  watchedCount: number;
  remainingRuntime: number;
  targetTitle: string;
}

export const RewatchProgress: React.FC<RewatchProgressProps> = ({
  totalMovies,
  watchedCount,
  remainingRuntime,
  targetTitle,
}) => {
  const percentage = totalMovies > 0 ? Math.round((watchedCount / totalMovies) * 100) : 100;
  const isComplete = totalMovies > 0 && watchedCount === totalMovies;

  // Trigger celebration confetti on 100% completion
  useEffect(() => {
    if (isComplete) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E63946', '#D6B36A', '#ffffff', '#10B981'],
        });
      } catch {
        // Ignore if confetti not supported
      }
    }
  }, [isComplete]);

  const remHours = Math.floor(remainingRuntime / 60);
  const remMinutes = remainingRuntime % 60;
  const formattedRemainingTime =
    remHours > 0 ? `${remHours}h ${remMinutes}m` : `${remMinutes}m`;

  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-cinematic space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gold">
            Progress Tracking
          </span>
          <h3 className="text-xl font-bold font-display text-text-main flex items-center gap-2">
            Preparation for {targetTitle}
            {isComplete && <Award className="w-5 h-5 text-gold animate-bounce" />}
          </h3>
        </div>

        {/* Big Counter Stat */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-black font-display text-text-main">
              {watchedCount} <span className="text-sm font-normal text-text-muted">of</span> {totalMovies}
            </span>
            <p className="text-xs text-text-muted">watched</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-dark border border-border-highlight flex items-center justify-center font-bold text-gold text-sm shadow-inner">
            {percentage}%
          </div>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-surface-dark rounded-full overflow-hidden border border-border-subtle p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${
              isComplete
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-r from-crimson via-amber-500 to-gold shadow-crimson-glow'
            }`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {totalMovies === 0
                ? 'No prerequisites required'
                : `${watchedCount} of ${totalMovies} watched`}
            </span>
          </span>

          <span className="flex items-center gap-1.5 font-medium text-text-main">
            <Clock className="w-3.5 h-3.5 text-gold" />
            <span>
              {remainingRuntime === 0 ? (
                <span className="text-emerald-400 font-semibold">Ready for Premiere!</span>
              ) : (
                <>
                  <span className="text-crimson font-bold">{formattedRemainingTime}</span> remaining watch time
                </>
              )}
            </span>
          </span>
        </div>
      </div>

      {/* Completion Banner */}
      {isComplete && totalMovies > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 flex items-center gap-3"
        >
          <Sparkles className="w-5 h-5 text-gold shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="text-xs">
            <span className="font-bold text-sm text-emerald-200">You are 100% Doomsday Ready!</span>
            <p className="text-emerald-300/80 mt-0.5">
              All prerequisites for {targetTitle} have been watched in sequence. Proceed to Cinema Booking to secure opening-night tickets!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
