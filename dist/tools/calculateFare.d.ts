import { TransitApiClient } from '../apiClient.js';
export declare const calculateFareToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            boarding_stop: {
                type: string;
                description: string;
            };
            alighting_stop: {
                type: string;
                description: string;
            };
            bus_number: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleCalculateFare(args: {
    boarding_stop: string;
    alighting_stop: string;
    bus_number?: string;
}, client: TransitApiClient): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
