import { TransitApiClient } from '../apiClient.js';
export declare const searchRoutesToolDefinition: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            from: {
                type: string;
                description: string;
            };
            to: {
                type: string;
                description: string;
            };
            max_transfers: {
                type: string;
                description: string;
                default: number;
            };
        };
        required: string[];
    };
};
export declare function handleSearchRoutes(args: {
    from: string;
    to: string;
    max_transfers?: number;
}, client: TransitApiClient): Promise<{
    content: {
        type: string;
        text: string;
    }[];
}>;
