import { TransitApiClient } from '../apiClient.js';

export const busDetailsToolDefinition = {
  name: "get_bus_details",
  description: `Lookup route details, platform bay at Periyar Bus Stand, spoke category, and stop sequence for a specific Madurai bus number (e.g. '44', '77', '11A', '5'). By default returns key transit milestones for token efficiency; set verbose=true for the complete numbered stop list.`,
  inputSchema: {
    type: "object",
    properties: {
      bus_number: {
        type: "string",
        description: "Bus number to inspect (e.g. '44', '77', '11A', '5', '48P')."
      },
      verbose: {
        type: "boolean",
        description: "Set to true to return the full numbered list of all intermediate stops. Default is false (returns key milestones).",
        default: false
      }
    },
    required: ["bus_number"]
  }
};

export async function handleBusDetails(
  args: { bus_number: string; verbose?: boolean },
  client: TransitApiClient
) {
  const isVerbose = Boolean(args.verbose);
  const result = await client.getBusDetails(args.bus_number, isVerbose);

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

    if (isVerbose) {
      const stopList = route.stops.map((s, i) => `${i + 1}. ${s}`).join('\n');
      text += `• **Complete Stop Timeline (${route.total_stops} stops)**:\n`;
      text += `\`\`\`\n${stopList}\n\`\`\`\n`;
    } else {
      text += `• **Key Route Milestones**: ${route.stops.join(' ➔ ')}\n`;
      if (route.total_stops > route.stops.length) {
        text += `  *(Use \`verbose: true\` to expand all ${route.total_stops} stops)*\n`;
      }
    }

    text += `• 🔗 **View Interactive Map**: ${route.canonical_url}\n\n`;
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
