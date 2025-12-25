import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ShopifyClient } from './shopify/client.ts';

const server = new McpServer({
  name: 'shopify-admin',
  version: '1.0.0',
});

let shopifyClient: ShopifyClient;

try {
  shopifyClient = new ShopifyClient();
} catch (error) {
  console.error('Failed to initialize Shopify client:', error);
  process.exit(1);
}

// Test connection tool for verification
server.tool(
  'test_connection',
  'Test Shopify API connection and return shop info',
  {},
  async () => {
    try {
      const result = await shopifyClient.testConnection();
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Connection failed: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
