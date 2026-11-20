import { ApiErrorResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  public status: number;
  public data: ApiErrorResponse;

  constructor(status: number, data: ApiErrorResponse) {
    super(data.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options?.headers || {});
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorPayload: ApiErrorResponse = isJson
      ? data
      : { error: 'HTTP_ERROR', message: String(data) };
    throw new ApiError(response.status, errorPayload);
  }

  return data as T;
}
