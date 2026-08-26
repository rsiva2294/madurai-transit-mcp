import { describe, it, expect, vi } from 'vitest';
import { createMcpServer } from '../src/index.js';
import { TransitApiClient } from '../src/apiClient.js';
import { handleSearchRoutes } from '../src/tools/searchRoutes.js';
import { handleBusDetails } from '../src/tools/busDetails.js';
import { handleSearchStops } from '../src/tools/searchStops.js';
import { handleCalculateFare } from '../src/tools/calculateFare.js';

describe('Madurai Transit MCP Server', () => {
  const mockApiClient = {
    searchRoutes: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        query: { from: 'PERIYAR BUS STAND', to: 'ALAGARKOVIL', max_transfers: 1 },
        results_count: 1,
        routes: [
          {
            type: 'DIRECT',
            id: 'direct_0',
            total_stops: 18,
            legs: [
              {
                from: 'PERIYAR BUS STAND',
                to: 'ALAGARKOVIL',
                bus_numbers: ['44', '44A'],
                stop_count: 18,
                pbs_platform: 'Platform I',
                fare: {
                  ordinary: 14,
                  express: 21,
                  deluxe_ac: 29,
                  source: 'OFFICIAL_TNSTC_STAGE_CHART',
                  stages_travelled: 11
                },
                stops: ['PERIYAR BUS STAND', 'SIMMAKKAL', 'ALAGARKOVIL']
              }
            ],
            canonical_url: 'https://maduraione.in/route/44-pbs-alagarkovil'
          }
        ]
      },
      metadata: {
        version: '1.0.0',
        network: 'Madurai CityBus (TNSTC)',
        data_notice: 'Route sequences and stage fares are based on official charts.',
        timings_notice: 'TNSTC Madurai operates on shift-based headway frequency.',
        attribution: 'Data & Routing by MaduraiOne CityBus (https://maduraione.in)'
      }
    }),

    getBusDetails: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        bus_number: '44',
        variants_count: 1,
        routes: [
          {
            route_id: '44_PBS - ALAGARKOVIL',
            route_name: 'PBS - ALAGARKOVIL',
            spoke: 'NORTH_SPOKE',
            pbs_platform: 'Platform I',
            total_stops: 28,
            stops: ['PERIYAR BUS STAND', 'SIMMAKKAL', 'ALAGARKOVIL'],
            canonical_url: 'https://maduraione.in/route/44-pbs-alagarkovil'
          }
        ]
      },
      metadata: {
        data_notice: 'Route sequences and stage fares are based on official charts.'
      }
    }),

    searchStops: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        query: 'periyar',
        matches_count: 1,
        stops: [
          {
            name_en: 'PERIYAR BUS STAND',
            name_ta: 'பெரியார் பேருந்து நிலையம்',
            spoke: 'CORE',
            route_count: 285,
            verified_coordinates: [9.9159325, 78.1108737]
          }
        ]
      }
    }),

    calculateFare: vi.fn().mockResolvedValue({
      status: 'success',
      data: {
        boarding_stop: 'PERIYAR BUS STAND',
        alighting_stop: 'MGR BUS STAND',
        stage_count: 5,
        fares: {
          ordinary: 9,
          lss: 10,
          express: 13,
          deluxe_ac: 18
        },
        source: 'OFFICIAL_TNSTC_STAGE_CHART'
      },
      metadata: {
        data_notice: 'Route sequences and stage fares are based on official charts.'
      }
    })
  } as unknown as TransitApiClient;

  it('should instantiate the MCP server with tools capability', () => {
    const server = createMcpServer(mockApiClient);
    expect(server).toBeDefined();
  });

  it('handleSearchRoutes should format markdown output with canonical link and disclaimers', async () => {
    const result = await handleSearchRoutes(
      { from: 'Periyar', to: 'Alagarkovil', max_transfers: 1 },
      mockApiClient
    );

    expect(result.content[0].type).toBe('text');
    const text = result.content[0].text;
    expect(text).toContain('Madurai CityBus Route Options');
    expect(text).toContain('44, 44A');
    expect(text).toContain('Platform I');
    expect(text).toContain('Ordinary ₹14');
    expect(text).toContain('https://maduraione.in/route/44-pbs-alagarkovil');
    expect(text).toContain('headway frequency');
  });

  it('handleBusDetails should format bus stop sequence and platform bay with milestone support', async () => {
    const result = await handleBusDetails(
      { bus_number: '44', verbose: false },
      mockApiClient
    );

    const text = result.content[0].text;
    expect(text).toContain('Bus 44');
    expect(text).toContain('NORTH_SPOKE');
    expect(text).toContain('Platform I');
    expect(text).toContain('Key Route Milestones');
    expect(text).toContain('https://maduraione.in/route/44-pbs-alagarkovil');
  });

  it('handleSearchStops should format bilingual stop search results', async () => {
    const result = await handleSearchStops(
      { query: 'periyar' },
      mockApiClient
    );

    const text = result.content[0].text;
    expect(text).toContain('PERIYAR BUS STAND');
    expect(text).toContain('பெரியார் பேருந்து நிலையம்');
    expect(text).toContain('9.9159325, 78.1108737');
  });

  it('handleCalculateFare should format markdown stage fare table', async () => {
    const result = await handleCalculateFare(
      { boarding_stop: 'PERIYAR BUS STAND', alighting_stop: 'MGR BUS STAND' },
      mockApiClient
    );

    const text = result.content[0].text;
    expect(text).toContain('Official TNSTC Stage Fare Breakdown');
    expect(text).toContain('₹9');
    expect(text).toContain('₹13');
    expect(text).toContain('OFFICIAL_TNSTC_STAGE_CHART');
  });
});
