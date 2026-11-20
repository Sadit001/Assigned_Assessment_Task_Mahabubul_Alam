import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Ticket, Layers, Armchair, ShieldCheck } from 'lucide-react';
import { BookingQuoteResult } from '../../types';
import { Badge } from '../common/Badge';

export interface BundleBreakdownProps {
  quote: BookingQuoteResult;
}

export const BundleBreakdown: React.FC<BundleBreakdownProps> = ({ quote }) => {
  if (!quote.possible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-surface-card border-2 border-red-500/40 shadow-cinematic text-center space-y-4"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-crimson">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <Badge variant="crimson" size="md">
            EXACT SEATS UNAVAILABLE
          </Badge>
          <h3 className="text-2xl font-black font-display text-text-main tracking-wider">
            NOT POSSIBLE
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">
            No exact combination of available bundle sizes at <span className="text-white font-semibold">{quote.cinema.name}</span> adds up to exactly <span className="text-crimson font-bold">{quote.groupSize} seats</span> without leaving empty, paid-for seats.
          </p>
          <p className="text-xs text-text-muted/60 pt-2">
            Try adjusting your watch party headcount or selecting a different cinema venue.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 rounded-2xl bg-surface-card border border-emerald-500/30 shadow-cinematic space-y-6"
    >
      {/* Header: Success Badge, Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle/60 pb-5">
        <div>
          <Badge variant="emerald" size="md" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            OPTIMAL BOOKING QUOTE FOUND
          </Badge>
          <h3 className="text-xl sm:text-2xl font-black font-display text-text-main mt-2">
            {quote.cinema.name}
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Exact match for <span className="text-white font-semibold">{quote.groupSize} guests</span> with zero wasted seats.
          </p>
        </div>

        {/* Big Total Bundles Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-3xl font-black font-display text-emerald-400">
              {quote.totalBundles}
            </span>
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">
              {quote.totalBundles === 1 ? 'Bundle' : 'Total Bundles'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-dark border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Breakdown Cards Grid */}
      <div className="space-y-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-text-muted">
          Required Bundle Sizes
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quote.breakdown?.map(item => (
            <div
              key={item.bundleSize}
              className="p-4 rounded-xl bg-surface-dark border border-border-highlight flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-crimson/15 border border-crimson/30 flex items-center justify-center text-crimson font-bold">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-main">
                    {item.bundleSize}-Seat Bundle
                  </h4>
                  <span className="text-xs text-text-muted">
                    {item.subtotalSeats} total seats
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-gold">
                  × {item.count}
                </span>
                <p className="text-[10px] text-text-muted uppercase">
                  {item.count === 1 ? 'bundle' : 'bundles'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-4 rounded-xl bg-surface-dark/80 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-gold shrink-0" />
          <span className="text-text-muted">Assessment Result String:</span>
          <span className="font-mono font-bold text-text-main bg-black/40 px-2 py-0.5 rounded border border-border-subtle">
            {quote.summary}
          </span>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{quote.totalSeats} seats booked = {quote.groupSize} guests</span>
        </div>
      </div>
    </motion.div>
  );
};
