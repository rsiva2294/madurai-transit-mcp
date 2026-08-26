export const searchRoutesToolDefinition = {
    name: "search_bus_routes",
    description: `Search bus routes between two stops in Madurai. Returns direct buses and 1-transfer options with stop counts, PBS platform bays, official TNSTC stage fares, and canonical visual map links. By default returns key milestones for token efficiency; set verbose=true for complete stop sequences.`,
    inputSchema: {
        type: "object",
        properties: {
            from: {
                type: "string",
                description: "Origin stop or landmark in Madurai (e.g. 'Periyar', 'Mattuthavani', 'Goripalayam', 'பெரியார்')."
            },
            to: {
                type: "string",
                description: "Destination stop or landmark in Madurai (e.g. 'Alagarkovil', 'Thirunagar', 'Airport')."
            },
            max_transfers: {
                type: "number",
                description: "Maximum transfers allowed: 0 for direct only, 1 for up to 1-transfer. Default is 1.",
                default: 1
            },
            verbose: {
                type: "boolean",
                description: "Set to true to return full intermediate stop lists for every leg. Default is false (key milestones).",
                default: false
            }
        },
        required: ["from", "to"]
    }
};
export async function handleSearchRoutes(args, client) {
    const isVerbose = Boolean(args.verbose);
    const result = await client.searchRoutes(args.from, args.to, args.max_transfers ?? 1, isVerbose);
    if (!result.data || result.data.routes.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No bus routes found between "${args.from}" and "${args.to}". Please try searching for major nearby hubs like "Periyar Bus Stand", "MGR Bus Stand", or "Arappalayam".`
                }
            ]
        };
    }
    const { query, results_count, routes } = result.data;
    const metadata = result.metadata;
    let text = `🚌 **Madurai CityBus Route Options**: ${query.from} ➔ ${query.to}\n`;
    text += `Found **${results_count}** viable transit option(s):\n\n`;
    routes.forEach((route, index) => {
        text += `### Option ${index + 1}: ${route.type === 'DIRECT' ? '🟢 Direct Route' : '🔄 1-Transfer Journey'} (${route.total_stops} stops)\n`;
        route.legs.forEach((leg, legIdx) => {
            text += `• **Leg ${legIdx + 1}**: ${leg.from} ➔ ${leg.to}\n`;
            text += `  - **Buses**: ${leg.bus_numbers.join(', ')}\n`;
            if (leg.pbs_platform) {
                text += `  - **Departure**: ${leg.pbs_platform}\n`;
            }
            if (leg.fare) {
                text += `  - **Official Fare**: Ordinary ₹${leg.fare.ordinary}${leg.fare.express ? ` | Express ₹${leg.fare.express}` : ''} (${leg.fare.source})\n`;
            }
            text += `  - **Stops (${leg.stop_count})**: ${leg.stops.join(' ➔ ')}\n`;
        });
        if (route.transfer_stop) {
            text += `• **Transfer Interchange**: ${route.transfer_stop}\n`;
        }
        text += `• 🔗 **View Interactive Map**: ${route.canonical_url}\n\n`;
    });
    if (metadata) {
        text += `---\n`;
        text += `ℹ️ *${metadata.data_notice}*\n`;
        text += `⚠️ *${metadata.timings_notice}*\n`;
        text += `🌐 *Live Bus Telemetry & Android App: https://maduraione.in*\n`;
    }
    return {
        content: [
            {
                type: "text",
                text
            }
        ]
    };
}
