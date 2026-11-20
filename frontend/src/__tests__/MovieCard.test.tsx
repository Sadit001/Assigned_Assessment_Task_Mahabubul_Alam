import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MovieCard } from '../components/movies/MovieCard';
import { Movie } from '../types';

describe('MovieCard', () => {
  const mockMovie: Movie = {
    id: 'movie-1',
    title: 'Iron Man',
    releaseYear: 2008,
    runtime: 126,
    watched: false,
    prerequisiteIds: [],
    prerequisites: [],
    dependents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders movie title, release year and runtime correctly', () => {
    render(
      <MovieCard
        movie={mockMovie}
        onToggleWatched={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Iron Man')).toBeInTheDocument();
    expect(screen.getByText('2008')).toBeInTheDocument();
    expect(screen.getByText(/2h 6m/i)).toBeInTheDocument();
  });

  it('calls onToggleWatched when watched button is clicked', () => {
    const handleToggle = vi.fn();
    render(
      <MovieCard
        movie={mockMovie}
        onToggleWatched={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const toggleBtn = screen.getByTitle('Mark as watched');
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledWith(mockMovie);
  });

  it('shows watched state when movie.watched is true', () => {
    const watchedMovie = { ...mockMovie, watched: true };
    render(
      <MovieCard
        movie={watchedMovie}
        onToggleWatched={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Watched')).toBeInTheDocument();
  });
});
