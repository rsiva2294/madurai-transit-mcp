const DEFAULT_API_BASE = process.env.MADURAI_TRANSIT_API_URL || 'https://madurai-transit-api.rsiva2294.workers.dev';
export class TransitApiClient {
    apiBase;
    timeoutMs;
    constructor(apiBase = DEFAULT_API_BASE, timeoutMs = 6000) {
        this.apiBase = apiBase.replace(/\/+$/, '');
        this.timeoutMs = timeoutMs;
    }
    async fetchJson(endpoint, params = {}) {
        const urlsToTry = [
            this.apiBase,
            'https://madurai-transit-api.rsiva2294.workers.dev',
            'https://api.maduraione.in',
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
                        'User-Agent': 'MaduraiTransitMCP/1.0.0'
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
                // If client error or specific API error (not connection failure), rethrow immediately
                if (error.message && !error.message.includes('fetch failed') && !error.message.includes('ECONNREFUSED')) {
                    throw error;
                }
            }
        }
        throw lastError || new Error(`Failed to connect to Madurai Transit API.`);
    }
    async searchRoutes(from, to, maxTransfers = 1) {
        return this.fetchJson('/search', { from, to, maxTransfers });
    }
    async getBusDetails(busNumber) {
        const cleanNumber = encodeURIComponent(busNumber.trim());
        return this.fetchJson(`/bus/${cleanNumber}`);
    }
    async searchStops(query) {
        return this.fetchJson('/stops', { q: query });
    }
    async calculateFare(board, alight, bus) {
        return this.fetchJson('/fare', { board, alight, bus });
    }
}
export const defaultApiClient = new TransitApiClient();
