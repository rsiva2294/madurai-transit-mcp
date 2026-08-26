export interface TransitApiRouteLeg {
  from: string;
  to: string;
  bus_numbers: string[];
  stop_count: number;
  pbs_platform?: string;
  fare: {
    ordinary: number;
    lss?: number;
    express?: number;
    deluxe_ac?: number;
    source: string;
    stages_travelled?: number;
  } | null;
  stops: string[];
}

export interface TransitApiRoute {
  type: 'DIRECT' | 'MULTI_LEG';
  id: string;
  total_stops: number;
  transfer_stop?: string;
  legs: TransitApiRouteLeg[];
  canonical_url: string;
}

export interface SearchRoutesResult {
  query: {
    from: string;
    to: string;
    max_transfers: number;
  };
  results_count: number;
  routes: TransitApiRoute[];
}

export interface BusDetailsResult {
  bus_number: string;
  variants_count: number;
  routes: {
    route_id: string;
    route_name: string;
    spoke: string;
    pbs_platform?: string;
    total_stops: number;
    stops: string[];
    canonical_url: string;
  }[];
}

export interface StopSearchResult {
  name_en: string;
  name_ta?: string;
  spoke: string;
  route_count: number;
  verified_coordinates?: [number, number];
  matched_landmark?: string;
  matched_alias?: string;
}

export interface FareCalculationResult {
  boarding_stop: string;
  alighting_stop: string;
  bus_number?: string;
  stage_count?: number;
  fares: {
    ordinary: number;
    lss: number;
    express: number;
    deluxe_ac: number;
  };
  source: string;
}

export interface ApiMetadata {
  version: string;
  network: string;
  confidence?: string;
  data_notice: string;
  timings_notice: string;
  attribution: string;
}

export interface ApiResponseWrapper<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: ApiMetadata;
}
