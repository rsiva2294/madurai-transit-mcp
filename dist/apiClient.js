const DEFAULT_API_BASE = process.env.MADURAI_TRANSIT_API_URL || 'https://api.maduraione.in';
export class TransitApiClient {
    apiBase;
    timeoutMs;
    constructor(apiBase = DEFAULT_API_BASE, timeoutMs = 6000) {
        this.apiBase = apiBase.replace(/\/+$/, '');
        this.timeoutMs = timeoutMs;
    }
    async fetchJson(endpoint, params = {}) {
        // Multi-tier fallback cascade: Branded domain -> Cloudflare Edge fallback -> Local Dev
        const urlsToTry = [
            this.apiBase,
            'https://api.maduraione.in',
            'https://madurai-transit-api.rsiva2294.workers.dev',
            'http://localhost:3001/api/v1'
        ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
        let lastError = null;
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
                        'User-Agent': 'MaduraiTransitMCP/1.0.4'
                    },
                    signal: controller.signal
                });
                clearTimeout(timer);
                if (response.ok) {
                    return await response.json();
                }
                const errJson = await response.json().catch(() => null);
                if (errJson?.error?.message) {
                    throw new Error(errJson.error.message);
                }
            }
            catch (error) {
                clearTimeout(timer);
                lastError = error;
                // If client error with specific API error message (not connection failure), rethrow immediately
                if (error.message && !error.message.includes('fetch failed') && !error.message.includes('ECONNREFUSED') && !error.name?.includes('AbortError')) {
                    throw error;
                }
            }
        }
        throw lastError || new Error(`Failed to connect to Madurai Transit API across edge endpoints.`);
    }
    async searchRoutes(from, to, maxTransfers = 1, verbose = false) {
        return this.fetchJson('/search', { from, to, maxTransfers, verbose });
    }
    async getBusDetails(busNumber, verbose = false) {
        const cleanNumber = encodeURIComponent(busNumber.trim());
        return this.fetchJson(`/bus/${cleanNumber}`, { verbose });
    }
    async searchStops(query) {
        return this.fetchJson('/stops', { q: query });
    }
    async calculateFare(board, alight, bus) {
        return this.fetchJson('/fare', { board, alight, bus });
    }
}
export const defaultApiClient = new TransitApiClient();
