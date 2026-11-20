import { apiClient } from './client';
import { Movie, RewatchOrderResult } from '../types';

export interface CreateMoviePayload {
  title: string;
  releaseYear: number;
  runtime: number;
  prerequisiteIds?: string[];
  watched?: boolean;
}

export interface UpdateMoviePayload {
  title?: string;
  releaseYear?: number;
  runtime?: number;
  prerequisiteIds?: string[];
  watched?: boolean;
}

export async function getMovies(params?: { search?: string; watched?: boolean }): Promise<Movie[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.watched !== undefined) query.set('watched', String(params.watched));

  const qs = query.toString();
  return apiClient<Movie[]>(`/movies${qs ? `?${qs}` : ''}`);
}

export async function getMovieById(id: string): Promise<Movie> {
  return apiClient<Movie>(`/movies/${id}`);
}

export async function createMovie(payload: CreateMoviePayload): Promise<Movie> {
  return apiClient<Movie>('/movies', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateMovie(id: string, payload: UpdateMoviePayload): Promise<Movie> {
  return apiClient<Movie>(`/movies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteMovie(id: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/movies/${id}`, {
    method: 'DELETE',
  });
}

export async function getRewatchOrder(id: string): Promise<RewatchOrderResult> {
  return apiClient<RewatchOrderResult>(`/movies/${id}/rewatch-order`);
}
