import { ApiResponseWrapper, SearchRoutesResult, BusDetailsResult, StopSearchResult, FareCalculationResult } from './types.js';

const DEFAULT_API_BASE = process.env.MADURAI_TRANSIT_API_URL || 'https://madurai-transit-api.rsiva2294.workers.dev';

export class TransitApiClient {
  private apiBase: string;
  private timeoutMs: number;

  constructor(apiBase: string = DEFAULT_API_BASE, timeoutMs: number = 6000) {
    this.apiBase = apiBase.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs;
  }

  private async fetchJson<T>(endpoint: string, params: Record<string, string | number | undefined> = {}): Promise<ApiResponseWrapper<T>> {
    const urlsToTry = [
      this.apiBase,
      'https://madurai-transit-api.rsiva2294.workers.dev',
      'https://api.maduraione.in',
      'http://localhost:3001/api/v1'
    ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

    let lastError: Error | null = null;

    for (const baseUrl of urlsToTry) {
      const url = new URL(`${baseUrl}${endpoint}`);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'MaduraiTransitMCP/1.0.0'
          },
          signal: controller.signal
        });

        clearTimeout(timer);

        if (response.ok) {
          return await response.json() as ApiResponseWrapper<T>;
        }

        const errJson = await response.json().catch(() => null) as ApiResponseWrapper<T> | null;
        if (errJson?.error?.message) {
          throw new Error(errJson.error.message);
        }
      } catch (error: any) {
        clearTimeout(timer);
        lastError = error;
        // If client error or specific API error (not connection failure), rethrow immediately
        if (error.message && !error.message.includes('fetch failed') && !error.message.includes('ECONNREFUSED')) {
          throw error;
        }
      }
    }

    throw lastError || new Error(`Failed to connect to Madurai Transit API.`);
  }

  public async searchRoutes(from: string, to: string, maxTransfers: number = 1): Promise<ApiResponseWrapper<SearchRoutesResult>> {
    return this.fetchJson<SearchRoutesResult>('/search', { from, to, maxTransfers });
  }

  public async getBusDetails(busNumber: string): Promise<ApiResponseWrapper<BusDetailsResult>> {
    const cleanNumber = encodeURIComponent(busNumber.trim());
    return this.fetchJson<BusDetailsResult>(`/bus/${cleanNumber}`);
  }

  public async searchStops(query: string): Promise<ApiResponseWrapper<{ query: string; matches_count: number; stops: StopSearchResult[] }>> {
    return this.fetchJson<{ query: string; matches_count: number; stops: StopSearchResult[] }>('/stops', { q: query });
  }

  public async calculateFare(board: string, alight: string, bus?: string): Promise<ApiResponseWrapper<FareCalculationResult>> {
    return this.fetchJson<FareCalculationResult>('/fare', { board, alight, bus });
  }
}

export const defaultApiClient = new TransitApiClient();
