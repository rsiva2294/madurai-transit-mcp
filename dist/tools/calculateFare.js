export const calculateFareToolDefinition = {
    name: "calculate_fare",
    description: `Calculate the official TNSTC stage fare between any boarding and alighting bus stop in Madurai across Ordinary, LSS, Express, and Deluxe/AC classes based on authoritative stage charts.`,
    inputSchema: {
        type: "object",
        properties: {
            boarding_stop: {
                type: "string",
                description: "Boarding stop name (e.g. 'PERIYAR BUS STAND', 'PBS', 'Kalavasal')."
            },
            alighting_stop: {
                type: "string",
                description: "Alighting stop name (e.g. 'MGR BUS STAND', 'Mattuthavani', 'Alagarkovil')."
            },
            bus_number: {
                type: "string",
                description: "Optional specific bus number to calculate exact route-stage fare (e.g. '44', '77', '5')."
            }
        },
        required: ["boarding_stop", "alighting_stop"]
    }
};
export async function handleCalculateFare(args, client) {
    const result = await client.calculateFare(args.boarding_stop, args.alighting_stop, args.bus_number);
    if (!result.data) {
        return {
            content: [
                {
                    type: "text",
                    text: `Could not calculate fare between "${args.boarding_stop}" and "${args.alighting_stop}".`
                }
            ]
        };
    }
    const { boarding_stop, alighting_stop, bus_number, stage_count, fares, source } = result.data;
    const metadata = result.metadata;
    let text = `🎫 **Official TNSTC Stage Fare Breakdown**\n`;
    text += `Journey: **${boarding_stop}** ➔ **${alighting_stop}**\n`;
    if (bus_number) {
        text += `Bus Service: **Route ${bus_number}**\n`;
    }
    text += `Stages Travelled: **${stage_count} stages**\n\n`;
    text += `| Service Class | Fare | Features |\n`;
    text += `|---|---|---|\n`;
    text += `| **Ordinary / City Regular** | **₹${fares.ordinary}** | Base commuter fare, valid for women free-travel scheme |\n`;
    text += `| **Limited Stop (LSS)** | **₹${fares.lss}** | Semi-fast service with fewer halts |\n`;
    text += `| **Express / Point-to-Point** | **₹${fares.express}** | Non-stop corridor express |\n`;
    text += `| **Deluxe / AC** | **₹${fares.deluxe_ac}** | Premium air-conditioned low-floor service |\n\n`;
    text += `• **Fare Calculation Source**: \`${source}\`\n`;
    if (metadata) {
        text += `---\n`;
        text += `ℹ️ *${metadata.data_notice}*\n`;
        text += `🌐 *Verify fares & live bus tracking on https://maduraione.in*\n`;
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
