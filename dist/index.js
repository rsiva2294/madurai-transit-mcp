import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { defaultApiClient } from './apiClient.js';
import { searchRoutesToolDefinition, handleSearchRoutes } from './tools/searchRoutes.js';
import { busDetailsToolDefinition, handleBusDetails } from './tools/busDetails.js';
import { searchStopsToolDefinition, handleSearchStops } from './tools/searchStops.js';
import { calculateFareToolDefinition, handleCalculateFare } from './tools/calculateFare.js';
export function createMcpServer(apiClient = defaultApiClient) {
    const server = new Server({
        name: "madurai-transit-mcp",
        version: "1.0.0"
    }, {
        capabilities: {
            tools: {}
        }
    });
    // Register available tools list
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                searchRoutesToolDefinition,
                busDetailsToolDefinition,
                searchStopsToolDefinition,
                calculateFareToolDefinition
            ]
        };
    });
    // Handle tool invocations
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            switch (name) {
                case "search_bus_routes": {
                    const typedArgs = args;
                    if (!typedArgs.from || !typedArgs.to) {
                        throw new Error("Missing required arguments 'from' and 'to'.");
                    }
                    return await handleSearchRoutes(typedArgs, apiClient);
                }
                case "get_bus_details": {
                    const typedArgs = args;
                    if (!typedArgs.bus_number) {
                        throw new Error("Missing required argument 'bus_number'.");
                    }
                    return await handleBusDetails(typedArgs, apiClient);
                }
                case "search_bus_stops": {
                    const typedArgs = args;
                    if (!typedArgs.query) {
                        throw new Error("Missing required argument 'query'.");
                    }
                    return await handleSearchStops(typedArgs, apiClient);
                }
                case "calculate_fare": {
                    const typedArgs = args;
                    if (!typedArgs.boarding_stop || !typedArgs.alighting_stop) {
                        throw new Error("Missing required arguments 'boarding_stop' and 'alighting_stop'.");
                    }
                    return await handleCalculateFare(typedArgs, apiClient);
                }
                default:
                    throw new Error(`Unknown tool name: ${name}`);
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `⚠️ Error executing tool '${name}': ${error.message || error}`
                    }
                ],
                isError: true
            };
        }
    });
    return server;
}
export async function main() {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🚀 Madurai CityBus MCP Server connected and running via stdio.");
}
// Run directly if invoked from CLI
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('cli.js') || process.argv[1]?.endsWith('index.js')) {
    main().catch((err) => {
        console.error("Fatal error in Madurai Transit MCP Server:", err);
        process.exit(1);
    });
}
