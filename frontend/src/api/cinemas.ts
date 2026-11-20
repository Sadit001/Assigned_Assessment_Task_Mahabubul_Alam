import { apiClient } from './client';
import { Cinema, BookingQuoteResult } from '../types';

export interface CreateCinemaPayload {
  name: string;
  bundleSizes: number[];
}

export async function getCinemas(): Promise<Cinema[]> {
  return apiClient<Cinema[]>('/cinemas');
}

export async function getCinemaById(id: string): Promise<Cinema> {
  return apiClient<Cinema>(`/cinemas/${id}`);
}

export async function createCinema(payload: CreateCinemaPayload): Promise<Cinema> {
  return apiClient<Cinema>('/cinemas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteCinema(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/cinemas/${id}`, {
    method: 'DELETE',
  });
}

export async function getBookingQuote(cinemaId: string, groupSize: number): Promise<BookingQuoteResult> {
  return apiClient<BookingQuoteResult>(`/cinemas/${cinemaId}/booking?groupSize=${groupSize}`);
}
