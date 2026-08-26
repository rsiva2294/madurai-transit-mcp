import { TransitApiClient } from '../apiClient.js';
export declare const busDetailsToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            bus_number: {
                type: string;
                description: string;
            };
            verbose: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
export declare function handleBusDetails(args: {
    bus_number: string;
    verbose?: boolean;
}, client: TransitApiClient): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
