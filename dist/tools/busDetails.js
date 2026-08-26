export const busDetailsToolDefinition = {
    name: "get_bus_details",
    description: `Lookup complete route details and full ordered stop sequence for a specific Madurai bus number (e.g. '44', '77', '11A', '5'). Returns total stops, departure platform bay at Periyar Bus Stand, spoke category, and full timeline.`,
    inputSchema: {
        type: "object",
        properties: {
            bus_number: {
                type: "string",
                description: "Bus number to inspect (e.g. '44', '77', '11A', '5', '48P')."
            }
        },
        required: ["bus_number"]
    }
};
export async function handleBusDetails(args, client) {
    const result = await client.getBusDetails(args.bus_number);
    if (!result.data || result.data.routes.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `Bus number "${args.bus_number}" was not found in the Madurai CityBus database.`
                }
            ]
        };
    }
    const { bus_number, variants_count, routes } = result.data;
    const metadata = result.metadata;
    let text = `🚌 **Madurai CityBus Route Profile: Bus ${bus_number}**\n`;
    text += `Found **${variants_count}** active route variant(s):\n\n`;
    routes.forEach((route, idx) => {
        text += `### Variant ${idx + 1}: ${route.route_name}\n`;
        text += `• **Transit Spoke Corridor**: ${route.spoke}\n`;
        if (route.pbs_platform) {
            text += `• **Periyar Bus Stand Departure**: ${route.pbs_platform}\n`;
        }
        text += `• **Total Stops**: ${route.total_stops}\n`;
        text += `• **Stop Sequence**:\n`;
        // Format stop list in 3-column rows or readable sequence
        const stopList = route.stops.map((s, i) => `${i + 1}. ${s}`).join('\n');
        text += `\`\`\`\n${stopList}\n\`\`\`\n`;
        text += `• 🔗 **View Route on Map**: ${route.canonical_url}\n\n`;
    });
    if (metadata) {
        text += `---\n`;
        text += `ℹ️ *${metadata.data_notice}*\n`;
        text += `🌐 *Live bus crowd status & offline search: https://maduraione.in*\n`;
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
