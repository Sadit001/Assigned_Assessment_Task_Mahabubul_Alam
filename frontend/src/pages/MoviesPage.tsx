import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Film, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Movie } from '../types';
import {
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  CreateMoviePayload,
  UpdateMoviePayload,
} from '../api/movies';
import { MovieCard } from '../components/movies/MovieCard';
import { MovieFilter } from '../components/movies/MovieFilter';
import { MovieFormModal } from '../components/movies/MovieFormModal';
import { MovieCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export const MoviesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [watchedFilter, setWatchedFilter] = useState<'all' | 'watched' | 'unwatched'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<Movie | null>(null);
  const [togglingMovieId, setTogglingMovieId] = useState<string | null>(null);

  // Fetch Movies
  const {
    data: movies = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['movies'],
    queryFn: () => getMovies(),
  });

  // Toggle Watched Mutation (Optimistic update)
  const toggleWatchedMutation = useMutation({
    mutationFn: ({ id, watched }: { id: string; watched: boolean }) =>
      updateMovie(id, { watched }),
    onMutate: async ({ id, watched }: { id: string; watched: boolean }) => {
      setTogglingMovieId(id);
      await queryClient.cancelQueries({ queryKey: ['movies'] });
      const previousMovies = queryClient.getQueryData<Movie[]>(['movies']);

      if (previousMovies) {
        queryClient.setQueryData<Movie[]>(['movies'], (old?: Movie[]) =>
          old?.map((m: Movie) => (m.id === id ? { ...m, watched } : m))
        );
      }

      return { previousMovies };
    },
    onError: (err: Error, _variables: any, context: any) => {
      if (context?.previousMovies) {
        queryClient.setQueryData(['movies'], context.previousMovies);
      }
      toast.error('Failed to update watched status', err.message);
    },
    onSuccess: (updatedMovie: Movie) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['rewatch-order'] });
      toast.success(
        updatedMovie.watched ? 'Marked as Watched' : 'Marked as Unwatched',
        `"${updatedMovie.title}" status updated successfully.`
      );
    },
    onSettled: () => {
      setTogglingMovieId(null);
    },
  });

  // Create Movie Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateMoviePayload) => createMovie(payload),
    onSuccess: (newMovie: Movie) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast.success('Movie Created', `"${newMovie.title}" was added to the MCU library.`);
    },
  });

  // Update Movie Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMoviePayload }) =>
      updateMovie(id, payload),
    onSuccess: (updatedMovie: Movie) => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['rewatch-order'] });
      toast.success('Movie Updated', `"${updatedMovie.title}" was successfully updated.`);
    },
  });

  // Delete Movie Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMovie(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['rewatch-order'] });
      toast.info('Movie Deleted', 'The movie was removed from the database.');
    },
    onError: (err: Error) => {
      toast.error('Failed to delete movie', err.message);
    },
  });

  const handleToggleWatched = (movie: Movie) => {
    toggleWatchedMutation.mutate({ id: movie.id, watched: !movie.watched });
  };

  const handleOpenAddModal = () => {
    setMovieToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie: Movie) => {
    setMovieToEdit(movie);
    setIsModalOpen(true);
  };

  const handleDeleteMovie = (movie: Movie) => {
    if (window.confirm(`Are you sure you want to delete "${movie.title}"? Any dependencies pointing to this movie will also be cleaned up.`)) {
      deleteMutation.mutate(movie.id);
    }
  };

  const handleModalSubmit = async (formData: any) => {
    if (movieToEdit) {
      await updateMutation.mutateAsync({
        id: movieToEdit.id,
        payload: {
          title: formData.title,
          releaseYear: formData.releaseYear,
          runtime: formData.runtime,
          watched: formData.watched,
          prerequisiteIds: formData.prerequisiteIds,
        },
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title,
        releaseYear: formData.releaseYear,
        runtime: formData.runtime,
        watched: formData.watched,
        prerequisiteIds: formData.prerequisiteIds,
      });
    }
  };

  // Filtered and Searched Movies
  const filteredMovies = useMemo(() => {
    return movies.filter((m: Movie) => {
      const matchesSearch =
        search.trim() === '' ||
        m.title.toLowerCase().includes(search.toLowerCase());

      const matchesWatched =
        watchedFilter === 'all' ||
        (watchedFilter === 'watched' && m.watched) ||
        (watchedFilter === 'unwatched' && !m.watched);

      return matchesSearch && matchesWatched;
    });
  }, [movies, search, watchedFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-gold">
            Catalog Management
          </span>
          <h1 className="text-3xl font-black font-display text-text-main flex items-center gap-2.5">
            <Film className="w-8 h-8 text-crimson" />
            MCU Movies & Prerequisites
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage MCU titles, declare prerequisite watch requirements, and maintain watched status.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAddModal}
        >
          Add Movie
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <MovieFilter
        search={search}
        onSearchChange={setSearch}
        watchedFilter={watchedFilter}
        onWatchedFilterChange={setWatchedFilter}
        onAddMovie={handleOpenAddModal}
        totalCount={movies.length}
      />

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-2xl bg-surface-card border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-crimson mx-auto" />
          <h3 className="text-lg font-bold text-text-main">Failed to load movies</h3>
          <p className="text-xs text-text-muted">{(error as Error)?.message}</p>
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => refetch()}>
            Retry Loading
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredMovies.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-surface-card border border-border-subtle space-y-4">
          <Film className="w-12 h-12 text-text-muted/40 mx-auto" />
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-lg font-bold font-display text-text-main">
              {search || watchedFilter !== 'all' ? 'No matching movies found' : 'No movies in database'}
            </h3>
            <p className="text-xs text-text-muted">
              {search || watchedFilter !== 'all'
                ? 'Try broadening your search criteria or resetting filters.'
                : 'Get started by creating your first MCU movie.'}
            </p>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleOpenAddModal}>
            Add Movie
          </Button>
        </div>
      )}

      {/* Movie Cards Grid */}
      {!isLoading && !isError && filteredMovies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie: Movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onToggleWatched={handleToggleWatched}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteMovie}
              isToggling={togglingMovieId === movie.id}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      <MovieFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        movieToEdit={movieToEdit}
        availableMovies={movies}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
