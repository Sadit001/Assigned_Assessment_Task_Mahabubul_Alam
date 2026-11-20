import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RewatchProgress } from '../components/rewatch/RewatchProgress';

describe('RewatchProgress', () => {
  it('calculates and displays progress percentage correctly', () => {
    render(
      <RewatchProgress
        totalMovies={7}
        watchedCount={4}
        remainingRuntime={380}
        targetTitle="Avengers: Doomsday"
      />
    );

    // 4 / 7 = ~57%
    expect(screen.getByText('57%')).toBeInTheDocument();
    expect(screen.getByText('4 of 7 watched')).toBeInTheDocument();
    expect(screen.getByText(/Preparation for Avengers: Doomsday/)).toBeInTheDocument();
  });

  it('displays remaining runtime correctly', () => {
    render(
      <RewatchProgress
        totalMovies={5}
        watchedCount={2}
        remainingRuntime={275}
        targetTitle="Avengers: Secret Wars"
      />
    );

    // 275 min = 4h 35m
    expect(screen.getByText(/4h 35m/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining watch time/i)).toBeInTheDocument();
  });

  it('displays completion state when all movies watched', () => {
    render(
      <RewatchProgress
        totalMovies={5}
        watchedCount={5}
        remainingRuntime={0}
        targetTitle="Avengers: Endgame"
      />
    );

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/Ready for Premiere!/i)).toBeInTheDocument();
    expect(screen.getByText(/You are 100% Doomsday Ready!/i)).toBeInTheDocument();
  });
});
