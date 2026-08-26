export const searchStopsToolDefinition = {
    name: "search_bus_stops",
    description: `Bilingual (English and Tamil) autocomplete and search for bus stops across Madurai. Returns canonical name, Tamil script name, spoke corridor, route frequency, and verified GPS coordinates if available.`,
    inputSchema: {
        type: "object",
        properties: {
            query: {
                type: "string",
                description: "Stop name, landmark, or Tamil transliteration to search (e.g. 'Periyar', 'Mattuthavani', 'பெரியார்', 'Meenakshi Temple')."
            }
        },
        required: ["query"]
    }
};
export async function handleSearchStops(args, client) {
    const result = await client.searchStops(args.query);
    if (!result.data || result.data.stops.length === 0) {
        return {
            content: [
                {
                    type: "text",
                    text: `No bus stops found matching query "${args.query}".`
                }
            ]
        };
    }
    const { query, matches_count, stops } = result.data;
    let text = `🚏 **Madurai Bus Stops Matching**: "${query}" (${matches_count} found)\n\n`;
    stops.forEach((stop, i) => {
        text += `${i + 1}. **${stop.name_en}**`;
        if (stop.name_ta) {
            text += ` (${stop.name_ta})`;
        }
        text += `\n`;
        text += `   • Spoke: ${stop.spoke} | Active Routes: ${stop.route_count}\n`;
        if (stop.matched_landmark) {
            text += `   • Matched Landmark: ${stop.matched_landmark}\n`;
        }
        if (stop.verified_coordinates) {
            text += `   • GPS (Verified): \`${stop.verified_coordinates[0]}, ${stop.verified_coordinates[1]}\`\n`;
        }
    });
    text += `\n🔗 *Search routes to any of these stops on https://maduraione.in*`;
    return {
        content: [
            {
                type: "text",
                text
            }
        ]
    };
}
