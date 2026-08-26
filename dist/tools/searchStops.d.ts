import { TransitApiClient } from '../apiClient.js';
export declare const searchStopsToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            query: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleSearchStops(args: {
    query: string;
}, client: TransitApiClient): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
