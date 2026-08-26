import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { TransitApiClient } from './apiClient.js';
export declare function createMcpServer(apiClient?: TransitApiClient): Server;
export declare function main(): Promise<void>;
