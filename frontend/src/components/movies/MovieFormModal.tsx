import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, AlertTriangle, Check, Film, Clock, Calendar } from 'lucide-react';
import { Movie } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ApiError } from '../../api/client';

const movieFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Movie title is required')
    .max(255, 'Movie title is too long'),
  releaseYear: z.coerce
    .number()
    .int('Release year must be a whole year')
    .min(1900, 'Must be 1900 or later')
    .max(2100, 'Must be 2100 or earlier'),
  runtime: z.coerce
    .number()
    .int('Runtime must be an integer')
    .min(1, 'Runtime must be at least 1 minute')
    .max(300, 'Runtime cannot exceed 300 minutes'),
  watched: z.boolean().default(false),
  prerequisiteIds: z.array(z.string()).default([]),
});

type MovieFormData = z.infer<typeof movieFormSchema>;

export interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovieFormData) => Promise<void>;
  movieToEdit?: Movie | null;
  availableMovies: Movie[];
  isSubmitting?: boolean;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  movieToEdit,
  availableMovies,
  isSubmitting = false,
}) => {
  const [circularError, setCircularError] = useState<{ message: string; path?: string[] } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: '',
      releaseYear: new Date().getFullYear(),
      runtime: 120,
      watched: false,
      prerequisiteIds: [],
    },
  });

  // Populate form when editing or resetting
  useEffect(() => {
    if (isOpen) {
      setCircularError(null);
      setGeneralError(null);
      if (movieToEdit) {
        reset({
          title: movieToEdit.title,
          releaseYear: movieToEdit.releaseYear,
          runtime: movieToEdit.runtime,
          watched: movieToEdit.watched,
          prerequisiteIds: movieToEdit.prerequisiteIds || [],
        });
      } else {
        reset({
          title: '',
          releaseYear: 2026,
          runtime: 120,
          watched: false,
          prerequisiteIds: [],
        });
      }
    }
  }, [isOpen, movieToEdit, reset]);

  // Candidates for prerequisites (cannot be itself)
  const selectableMovies = availableMovies.filter(m => !movieToEdit || m.id !== movieToEdit.id);

  const handleFormSubmit = async (data: MovieFormData) => {
    setCircularError(null);
    setGeneralError(null);

    try {
      await onSubmit(data);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.data.error === 'CIRCULAR_DEPENDENCY') {
          setCircularError({
            message: err.data.message,
            path: err.data.cyclePath,
          });
          return;
        }
        if (err.data.error === 'DUPLICATE_TITLE') {
          setError('title', { message: err.data.message });
          return;
        }
        setGeneralError(err.data.message || 'Failed to save movie');
      } else {
        setGeneralError(err.message || 'An unexpected error occurred');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={movieToEdit ? 'Edit Movie' : 'Add New Movie'}
      subtitle={
        movieToEdit
          ? `Modify details and dependency sequence for "${movieToEdit.title}"`
          : 'Add a new MCU movie to your database with prerequisite watch order'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        {/* Circular Dependency Alert */}
        {circularError && (
          <div className="p-4 rounded-xl border border-crimson/50 bg-crimson/10 text-crimson flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Circular Dependency Detected</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                {circularError.message}
              </p>
              {circularError.path && circularError.path.length > 0 && (
                <div className="mt-2 text-xs font-mono bg-black/40 p-2 rounded border border-crimson/30 text-white">
                  Cycle: {circularError.path.join(' ➔ ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {generalError && (
          <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Title Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Movie Title <span className="text-crimson">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
              <Film className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Avengers: Doomsday"
              {...register('title')}
              className={`w-full pl-10 pr-4 py-2.5 bg-surface-card border rounded-xl text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-crimson transition-all ${
                errors.title ? 'border-crimson' : 'border-border-subtle focus:border-crimson'
              }`}
            />
          </div>
          {errors.title && (
            <p className="text-xs text-crimson mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Release Year & Runtime Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Release Year */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Release Year <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                placeholder="2026"
                {...register('releaseYear')}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface-card border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-crimson transition-all ${
                  errors.releaseYear ? 'border-crimson' : 'border-border-subtle focus:border-crimson'
                }`}
              />
            </div>
            {errors.releaseYear && (
              <p className="text-xs text-crimson mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.releaseYear.message}
              </p>
            )}
          </div>

          {/* Runtime */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
              Runtime (Minutes: 1–300) <span className="text-crimson">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="number"
                placeholder="180"
                {...register('runtime')}
                className={`w-full pl-10 pr-4 py-2.5 bg-surface-card border rounded-xl text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-crimson transition-all ${
                  errors.runtime ? 'border-crimson' : 'border-border-subtle focus:border-crimson'
                }`}
              />
            </div>
            {errors.runtime && (
              <p className="text-xs text-crimson mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.runtime.message}
              </p>
            )}
          </div>
        </div>

        {/* Prerequisites Multi-Select */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
            Prerequisites (Watch These First)
          </label>
          <p className="text-xs text-text-muted mb-2">
            Select the movies that must be watched before this one. Graph validation prevents circular dependencies.
          </p>

          <Controller
            control={control}
            name="prerequisiteIds"
            render={({ field }: { field: any }) => {
              const selectedIds = new Set(field.value || []);

              const toggleSelect = (id: string) => {
                if (selectedIds.has(id)) {
                  selectedIds.delete(id);
                } else {
                  selectedIds.add(id);
                }
                field.onChange(Array.from(selectedIds));
              };

              if (selectableMovies.length === 0) {
                return (
                  <p className="text-xs text-text-muted/60 italic p-3 bg-surface-card rounded-xl border border-border-subtle">
                    No other movies available in the database yet.
                  </p>
                );
              }

              return (
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-surface-card rounded-xl border border-border-subtle custom-scrollbar">
                  {selectableMovies.map(m => {
                    const isSelected = selectedIds.has(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleSelect(m.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all select-none text-xs ${
                          isSelected
                            ? 'bg-crimson/20 border border-crimson/40 text-white'
                            : 'hover:bg-white/5 border border-transparent text-text-muted'
                        }`}
                      >
                        <span className="font-medium truncate mr-2">{m.title}</span>
                        <div className="flex items-center gap-2 shrink-0 text-[11px] text-text-muted">
                          <span>{m.releaseYear}</span>
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected
                                ? 'bg-crimson border-crimson text-white'
                                : 'border-border-highlight'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
        </div>

        {/* Watched Status Checkbox */}
        <div className="pt-2 border-t border-border-subtle/50">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('watched')}
              className="w-4 h-4 rounded border-border-subtle bg-surface-card text-crimson focus:ring-crimson accent-crimson cursor-pointer"
            />
            <div>
              <span className="text-sm font-medium text-text-main">Mark as Watched</span>
              <p className="text-xs text-text-muted">
                Has this movie already been completed in your rewatch preparation?
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {movieToEdit ? 'Save Changes' : 'Create Movie'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
