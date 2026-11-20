import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Cinema } from '../types';
import { getCinemas, createCinema, deleteCinema, getBookingQuote } from '../api/cinemas';
import { CinemaSelector } from '../components/booking/CinemaSelector';
import { BookingCalculator } from '../components/booking/BookingCalculator';
import { BundleBreakdown } from '../components/booking/BundleBreakdown';
import { AddCinemaModal } from '../components/booking/AddCinemaModal';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export const BookingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState<number>(44); // default to assessment test size 44
  const [isAddCinemaOpen, setIsAddCinemaOpen] = useState(false);

  // 1. Fetch Cinemas
  const {
    data: cinemas = [],
    isLoading: isCinemasLoading,
    isError: isCinemasError,
    error: cinemasError,
    refetch: refetchCinemas,
  } = useQuery({
    queryKey: ['cinemas'],
    queryFn: () => getCinemas(),
  });

  // Default select first cinema when loaded
  useEffect(() => {
    if (cinemas.length > 0 && !selectedCinemaId) {
      // Prefer Sanctum Sanctorum (bundles 6, 9, 20) as an impressive default
      const sanctum = cinemas.find((c: Cinema) => c.name.includes('Sanctum'));
      setSelectedCinemaId(sanctum ? sanctum.id : cinemas[0].id);
    }
  }, [cinemas, selectedCinemaId]);

  // 2. Fetch Booking Quote
  const {
    data: quote,
    isLoading: isQuoteLoading,
    isError: isQuoteError,
    error: quoteError,
    refetch: refetchQuote,
  } = useQuery({
    queryKey: ['booking-quote', selectedCinemaId, groupSize],
    queryFn: () => getBookingQuote(selectedCinemaId!, groupSize),
    enabled: !!selectedCinemaId && groupSize > 0,
  });

  // Create Cinema Mutation
  const createCinemaMutation = useMutation({
    mutationFn: (data: { name: string; bundleSizes: number[] }) => createCinema(data),
    onSuccess: (newCinema: Cinema) => {
      queryClient.invalidateQueries({ queryKey: ['cinemas'] });
      setSelectedCinemaId(newCinema.id);
      toast.success('Cinema Added', `"${newCinema.name}" was added to available venues.`);
    },
    onError: (err: Error) => {
      toast.error('Failed to create cinema', err.message);
    },
  });

  // Delete Cinema Mutation
  const deleteCinemaMutation = useMutation({
    mutationFn: (id: string) => deleteCinema(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cinemas'] });
      setSelectedCinemaId(null);
      toast.info('Cinema Removed', 'The venue was deleted.');
    },
    onError: (err: Error) => {
      toast.error('Failed to delete cinema', err.message);
    },
  });

  const handleDeleteCinema = (cinema: Cinema) => {
    if (window.confirm(`Are you sure you want to remove "${cinema.name}"?`)) {
      deleteCinemaMutation.mutate(cinema.id);
    }
  };

  const handleCreateCinema = async (data: { name: string; bundleSizes: number[] }) => {
    await createCinemaMutation.mutateAsync(data);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-gold">
          Feature 2: Dynamic Programming Seating Optimizer
        </span>
        <h1 className="text-3xl font-black font-display text-text-main flex items-center gap-2.5 mt-1">
          <Ticket className="w-8 h-8 text-crimson" />
          Watch-Party Cinema Booking
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-3xl">
          Cinemas sell opening-night seats only in fixed bundles. Our Dynamic Programming optimizer computes the minimum possible bundles to seat your exact group size without paying for empty seats.
        </p>
      </div>

      {/* Error state */}
      {isCinemasError && (
        <div className="p-6 rounded-2xl bg-surface-card border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
          <h3 className="text-lg font-bold text-text-main">Failed to load cinemas</h3>
          <p className="text-xs text-text-muted">{(cinemasError as Error)?.message}</p>
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetchCinemas()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isCinemasLoading && (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      )}

      {/* Main Content */}
      {!isCinemasLoading && cinemas.length > 0 && (
        <div className="space-y-8">
          {/* Cinema Selector */}
          <CinemaSelector
            cinemas={cinemas}
            selectedCinemaId={selectedCinemaId}
            onSelect={setSelectedCinemaId}
            onAddCinema={() => setIsAddCinemaOpen(true)}
            onDeleteCinema={handleDeleteCinema}
          />

          {/* Booking Calculator Input */}
          <BookingCalculator
            groupSize={groupSize}
            onGroupSizeChange={setGroupSize}
            onCalculate={() => refetchQuote()}
            isLoading={isQuoteLoading}
            disabled={!selectedCinemaId}
          />

          {/* Calculation Result */}
          {isQuoteLoading && (
            <div className="p-8 rounded-2xl bg-surface-card border border-border-subtle flex flex-col items-center justify-center space-y-3">
              <Layers className="w-8 h-8 text-gold animate-bounce" />
              <p className="text-sm font-semibold text-text-main">
                Running Dynamic Programming Optimizer...
              </p>
              <p className="text-xs text-text-muted">
                Calculating minimum bundles for {groupSize} seats.
              </p>
            </div>
          )}

          {isQuoteError && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
              {(quoteError as Error)?.message || 'Failed to calculate quote'}
            </div>
          )}

          {!isQuoteLoading && quote && (
            <BundleBreakdown quote={quote} />
          )}
        </div>
      )}

      {/* Add Cinema Modal */}
      <AddCinemaModal
        isOpen={isAddCinemaOpen}
        onClose={() => setIsAddCinemaOpen(false)}
        onSubmit={handleCreateCinema}
        isSubmitting={createCinemaMutation.isPending}
      />
    </div>
  );
};
