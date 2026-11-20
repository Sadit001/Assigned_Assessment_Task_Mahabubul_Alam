import React from 'react';
import { Users, Calculator, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export interface BookingCalculatorProps {
  groupSize: number;
  onGroupSizeChange: (size: number) => void;
  onCalculate: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const BookingCalculator: React.FC<BookingCalculatorProps> = ({
  groupSize,
  onGroupSizeChange,
  onCalculate,
  isLoading = false,
  disabled = false,
}) => {
  // Quick preset sizes including assessment test values
  const presets = [6, 7, 11, 44, 100, 250];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val)) {
      onGroupSizeChange(1);
    } else {
      onGroupSizeChange(Math.max(1, Math.min(10000, val)));
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-card border border-border-subtle shadow-cinematic space-y-5">
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-gold flex items-center gap-1.5 mb-1">
          <Calculator className="w-4 h-4 text-crimson" />
          Party Size Optimizer
        </span>
        <h3 className="text-lg sm:text-xl font-bold font-display text-text-main">
          Watch-Party Group Size
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Enter exact guest headcount (1–10,000). Our algorithm finds the minimum total bundles with zero empty seats.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Number Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Users className="w-5 h-5 text-crimson" />
          </div>
          <input
            type="number"
            min={1}
            max={10000}
            value={groupSize || ''}
            onChange={handleInputChange}
            placeholder="Enter group size (e.g. 44)"
            className="w-full pl-11 pr-4 py-3 bg-surface-dark border border-border-highlight rounded-xl text-text-main text-base font-semibold focus:outline-none focus:ring-2 focus:ring-crimson focus:border-crimson transition-all"
          />
        </div>

        {/* Calculate Action */}
        <Button
          variant="primary"
          size="lg"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={onCalculate}
          isLoading={isLoading}
          disabled={disabled || !groupSize}
          className="shrink-0"
        >
          Calculate Bundles
        </Button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className="text-xs text-text-muted mr-1">Sample Headcounts:</span>
        {presets.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => onGroupSizeChange(size)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
              groupSize === size
                ? 'bg-crimson text-white shadow-crimson-glow'
                : 'bg-surface-dark text-text-muted hover:text-white border border-border-subtle hover:border-border-highlight'
            }`}
          >
            {size} {size === 1 ? 'person' : 'guests'}
          </button>
        ))}
      </div>
    </div>
  );
};
