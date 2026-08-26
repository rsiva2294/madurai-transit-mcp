import { ApiResponseWrapper, SearchRoutesResult, BusDetailsResult, StopSearchResult, FareCalculationResult } from './types.js';
export declare class TransitApiClient {
    private apiBase;
    private timeoutMs;
    constructor(apiBase?: string, timeoutMs?: number);
    private fetchJson;
    searchRoutes(from: string, to: string, maxTransfers?: number): Promise<ApiResponseWrapper<SearchRoutesResult>>;
    getBusDetails(busNumber: string): Promise<ApiResponseWrapper<BusDetailsResult>>;
    searchStops(query: string): Promise<ApiResponseWrapper<{
        query: string;
        matches_count: number;
        stops: StopSearchResult[];
    }>>;
    calculateFare(board: string, alight: string, bus?: string): Promise<ApiResponseWrapper<FareCalculationResult>>;
}
export declare const defaultApiClient: TransitApiClient;
