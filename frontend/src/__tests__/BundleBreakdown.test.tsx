import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BundleBreakdown } from '../components/booking/BundleBreakdown';
import { BookingQuoteResult } from '../types';

describe('BundleBreakdown', () => {
  it('renders impossible state correctly when quote.possible is false', () => {
    const impossibleQuote: BookingQuoteResult = {
      cinema: { id: 'c1', name: 'Stark Tower IMAX' },
      groupSize: 11,
      possible: false,
      summary: 'Impossible to seat group size 11 exactly.',
    };

    render(<BundleBreakdown quote={impossibleQuote} />);

    expect(screen.getByText('NOT POSSIBLE')).toBeInTheDocument();
    expect(screen.getByText(/Stark Tower IMAX/i)).toBeInTheDocument();
    expect(screen.getByText(/11 seats/i)).toBeInTheDocument();
  });

  it('renders optimal bundle breakdown when quote.possible is true', () => {
    const validQuote: BookingQuoteResult = {
      cinema: { id: 'c1', name: 'Avengers Compound Cinema' },
      groupSize: 11,
      possible: true,
      totalBundles: 3,
      totalSeats: 11,
      summary: 'Minimum 3 bundles required.',
      breakdown: [
        { bundleSize: 5, count: 1, subtotalSeats: 5 },
        { bundleSize: 3, count: 2, subtotalSeats: 6 },
      ],
    };

    render(<BundleBreakdown quote={validQuote} />);

    expect(screen.getByText('OPTIMAL BOOKING QUOTE FOUND')).toBeInTheDocument();
    expect(screen.getByText(/Avengers Compound Cinema/i)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // total bundles
    expect(screen.getByText(/5-Seat Bundle/i)).toBeInTheDocument();
    expect(screen.getByText(/3-Seat Bundle/i)).toBeInTheDocument();
  });
});
