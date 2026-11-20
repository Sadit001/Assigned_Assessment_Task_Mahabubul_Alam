import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, X, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ApiError } from '../../api/client';

const cinemaFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Cinema name is required')
    .max(255, 'Cinema name is too long'),
});

type CinemaFormData = z.infer<typeof cinemaFormSchema>;

export interface AddCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; bundleSizes: number[] }) => Promise<void>;
  isSubmitting?: boolean;
}

export const AddCinemaModal: React.FC<AddCinemaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [bundleSizes, setBundleSizes] = useState<number[]>([2, 5]);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CinemaFormData>({
    resolver: zodResolver(cinemaFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleAddBundleSize = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBundleError(null);

    const val = parseInt(newSizeInput.trim(), 10);
    if (isNaN(val) || val < 1 || val > 500) {
      setBundleError('Bundle size must be between 1 and 500 seats');
      return;
    }

    if (bundleSizes.includes(val)) {
      setBundleError(`Bundle size ${val} already added`);
      return;
    }

    if (bundleSizes.length >= 10) {
      setBundleError('A cinema can have at most 10 bundle sizes');
      return;
    }

    setBundleSizes(prev => [...prev, val].sort((a, b) => a - b));
    setNewSizeInput('');
  };

  const handleRemoveBundleSize = (sizeToRemove: number) => {
    setBundleSizes(prev => prev.filter(s => s !== sizeToRemove));
  };

  const handleFormSubmit = async (data: CinemaFormData) => {
    setBundleError(null);
    setGeneralError(null);

    if (bundleSizes.length === 0) {
      setBundleError('Please add at least 1 bundle size');
      return;
    }

    try {
      await onSubmit({
        name: data.name,
        bundleSizes,
      });
      reset();
      setBundleSizes([2, 5]);
      setNewSizeInput('');
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.data.error === 'DUPLICATE_CINEMA_NAME') {
          setError('name', { message: err.data.message });
          return;
        }
        setGeneralError(err.data.message || 'Failed to create cinema');
      } else {
        setGeneralError(err.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Cinema Venue"
      subtitle="Configure a cinema and its opening-night seat bundle offerings (1–10 bundles, 1–500 seats each)."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {generalError && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Cinema Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Cinema Name <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Building2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Asgardian Grand Theatre"
              {...register('name')}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface-card border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-crimson transition-all ${
                errors.name ? 'border-crimson' : 'border-border-subtle focus:border-crimson'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-crimson mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Bundle Sizes Management */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Seat Bundle Sizes (1–10 bundles) <span className="text-crimson">*</span>
            </label>
            <span className="text-xs text-gold font-mono">{bundleSizes.length} / 10</span>
          </div>

          {/* Add Bundle Input Row */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="number"
              min={1}
              max={500}
              value={newSizeInput}
              onChange={e => setNewSizeInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBundleSize();
                }
              }}
              placeholder="Bundle size (1–500 seats)"
              className="flex-1 px-3 py-2 bg-surface-card border border-border-subtle rounded-xl text-text-main text-xs focus:outline-none focus:ring-2 focus:ring-crimson"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5 text-crimson" />}
              onClick={() => handleAddBundleSize()}
              disabled={bundleSizes.length >= 10 || !newSizeInput}
            >
              Add
            </Button>
          </div>

          {bundleError && (
            <p className="text-xs text-crimson mb-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {bundleError}
            </p>
          )}

          {/* Current Bundles Badges */}
          <div className="flex flex-wrap gap-2 p-3 bg-surface-card rounded-xl border border-border-subtle min-h-[50px] items-center">
            {bundleSizes.length === 0 ? (
              <span className="text-xs text-text-muted/50 italic">
                No bundle sizes added yet.
              </span>
            ) : (
              bundleSizes.map(size => (
                <span
                  key={size}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-dark border border-border-highlight text-xs text-text-main"
                >
                  <span className="font-bold text-gold">{size}</span>
                  <span className="text-text-muted">seats</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBundleSize(size)}
                    className="text-text-muted hover:text-red-400 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Create Cinema
          </Button>
        </div>
      </form>
    </Modal>
  );
};
