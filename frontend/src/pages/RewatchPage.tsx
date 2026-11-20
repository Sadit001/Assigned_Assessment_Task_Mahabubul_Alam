import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { Movie } from '../types';
import { getMovies, getRewatchOrder, updateMovie } from '../api/movies';
import { TargetSelector } from '../components/rewatch/TargetSelector';
import { RewatchProgress } from '../components/rewatch/RewatchProgress';
import { RewatchTimeline } from '../components/rewatch/RewatchTimeline';
import { Skeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export const RewatchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [togglingMovieId, setTogglingMovieId] = useState<string | null>(null);

  // 1. Fetch all movies to populate the target movie selector
  const {
    data: allMovies = [],
    isLoading: isMoviesLoading,
  } = useQuery<Movie[]>({
    queryKey: ['movies'],
    queryFn: () => getMovies(),
  });

  // Selected target movie state (synced with ?target=ID in URL)
  const targetFromUrl = searchParams.get('target');
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(targetFromUrl);

  // Auto-select Avengers: Doomsday if available and no URL param given
  useEffect(() => {
    if (allMovies.length > 0) {
      if (targetFromUrl && allMovies.some((m: Movie) => m.id === targetFromUrl)) {
        setSelectedMovieId(targetFromUrl);
      } else if (!selectedMovieId) {
        const doomsday = allMovies.find((m: Movie) => m.title.toLowerCase().includes('doomsday'));
        const defaultId = doomsday ? doomsday.id : allMovies[allMovies.length - 1].id;
        setSelectedMovieId(defaultId);
        setSearchParams({ target: defaultId });
      }
    }
  }, [allMovies, targetFromUrl, selectedMovieId, setSearchParams]);

  const handleSelectTarget = (id: string) => {
    setSelectedMovieId(id);
    setSearchParams({ target: id });
  };

  // 2. Fetch Rewatch Order from GET /api/movies/:id/rewatch-order
  const {
    data: rewatchOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
    refetch: refetchOrder,
  } = useQuery({
    queryKey: ['rewatch-order', selectedMovieId],
    queryFn: () => getRewatchOrder(selectedMovieId!),
    enabled: !!selectedMovieId,
  });

  // Watched state toggle mutation from within the timeline
  const toggleWatchedMutation = useMutation({
    mutationFn: ({ id, watched }: { id: string; watched: boolean }) =>
      updateMovie(id, { watched }),
    onMutate: async ({ id, watched }: { id: string; watched: boolean }) => {
      setTogglingMovieId(id);
      await queryClient.cancelQueries({ queryKey: ['rewatch-order', selectedMovieId] });
      const previousOrder = queryClient.getQueryData(['rewatch-order', selectedMovieId]);

      // Optimistically update
      queryClient.setQueryData(['rewatch-order', selectedMovieId], (old: any) => {
        if (!old) return old;
        const newMovies = old.movies.map((m: any) =>
          m.id === id ? { ...m, watched } : m
        );
        const watchedCount = newMovies.filter((m: any) => m.watched).length;
        const unwatchedCount = newMovies.length - watchedCount;
        const remainingRuntime = newMovies
          .filter((m: any) => !m.watched)
          .reduce((sum: number, m: any) => sum + m.runtime, 0);

        return {
          ...old,
          movies: newMovies,
          watchedCount,
          unwatchedCount,
          remainingRuntime,
        };
      });

      return { previousOrder };
    },
    onError: (err: Error, _variables: any, context: any) => {
      if (context?.previousOrder) {
        queryClient.setQueryData(['rewatch-order', selectedMovieId], context.previousOrder);
      }
      toast.error('Failed to update status', err.message);
    },
    onSuccess: (updatedMovie: Movie) => {
      queryClient.invalidateQueries({ queryKey: ['rewatch-order', selectedMovieId] });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success(
        updatedMovie.watched ? 'Step Completed' : 'Step Reopened',
        `Updated watch status for "${updatedMovie.title}".`
      );
    },
    onSettled: () => {
      setTogglingMovieId(null);
    },
  });

  const handleToggleWatched = (movie: Movie) => {
    toggleWatchedMutation.mutate({ id: movie.id, watched: !movie.watched });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-gold">
          Feature 1: Graph-Based Rewatch Ordering
        </span>
        <h1 className="text-3xl font-black font-display text-text-main flex items-center gap-2.5 mt-1">
          <Compass className="w-8 h-8 text-gold" />
          MCU Rewatch Roadmap
        </h1>
        <p className="text-sm text-text-muted mt-1 max-w-3xl">
          Select any destination movie to compute its full transitive prerequisite tree in topologically sorted watch order. Track your watched progress and calculate remaining watch time.
        </p>
      </div>

      {/* Target Selector */}
      <TargetSelector
        movies={allMovies}
        selectedMovieId={selectedMovieId}
        onSelect={handleSelectTarget}
        isLoading={isMoviesLoading}
      />

      {/* Error state */}
      {isOrderError && (
        <div className="p-6 rounded-2xl bg-surface-card border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
          <h3 className="text-lg font-bold text-text-main">Failed to generate rewatch roadmap</h3>
          <p className="text-xs text-text-muted">{(orderError as Error)?.message}</p>
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetchOrder()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isOrderLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      )}

      {/* Content when loaded */}
      {!isOrderLoading && rewatchOrder && (
        <div className="space-y-8">
          {/* Progress Card */}
          <RewatchProgress
            totalMovies={rewatchOrder.totalMovies}
            watchedCount={rewatchOrder.watchedCount}
            remainingRuntime={rewatchOrder.remainingRuntime}
            targetTitle={rewatchOrder.targetMovie.title}
          />

          {/* Sequential Timeline */}
          <RewatchTimeline
            orderResult={rewatchOrder}
            onToggleWatched={handleToggleWatched}
            isTogglingId={togglingMovieId}
          />
        </div>
      )}
    </div>
  );
};
