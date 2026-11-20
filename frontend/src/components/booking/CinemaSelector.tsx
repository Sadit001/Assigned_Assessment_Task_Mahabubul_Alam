import React from 'react';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { Cinema } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export interface CinemaSelectorProps {
  cinemas: Cinema[];
  selectedCinemaId: string | null;
  onSelect: (cinemaId: string) => void;
  onAddCinema: () => void;
  onDeleteCinema?: (cinema: Cinema) => void;
  isLoading?: boolean;
}

export const CinemaSelector: React.FC<CinemaSelectorProps> = ({
  cinemas,
  selectedCinemaId,
  onSelect,
  onAddCinema,
  onDeleteCinema,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-cinematic space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gold flex items-center gap-1.5 mb-1">
            <Building2 className="w-4 h-4 text-crimson" />
            Cinema Venue
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-display text-text-main">
            Select Opening-Night Venue
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Different venues offer different seat bundle configurations for watch parties.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Plus className="w-4 h-4 text-crimson" />}
          onClick={onAddCinema}
        >
          Add Cinema
        </Button>
      </div>

      {/* Cinema Cards Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {cinemas.map(cinema => {
          const isSelected = cinema.id === selectedCinemaId;
          const bundleSizes = cinema.bundles.map(b => b.bundleSize).sort((a, b) => a - b);

          return (
            <div
              key={cinema.id}
              onClick={() => onSelect(cinema.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative group ${
                isSelected
                  ? 'border-crimson bg-crimson/10 shadow-crimson-glow'
                  : 'border-border-subtle hover:border-border-highlight bg-surface-dark/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold font-display text-text-main group-hover:text-white transition-colors">
                    {cinema.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[11px] text-text-muted">Bundles:</span>
                    {bundleSizes.map(size => (
                      <Badge key={size} variant={isSelected ? 'crimson' : 'slate'} size="sm">
                        {size} seats
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-crimson bg-crimson text-white' : 'border-border-highlight'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  {onDeleteCinema && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteCinema(cinema);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 rounded transition-opacity"
                      title="Delete cinema"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
