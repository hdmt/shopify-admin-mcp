import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ShopifyClient } from './shopify/client.ts';
import { getMonthlyRanking } from './tools/orders/getMonthlyRanking.ts';
import { createCollection } from './tools/collections/createCollection.ts';
import { addProductsToCollection } from './tools/collections/addProductsToCollection.ts';
import { getCollections } from './tools/collections/getCollections.ts';
import { getCollection } from './tools/collections/getCollection.ts';
import { duplicateCollection } from './tools/collections/duplicateCollection.ts';
import { getBlogs } from './tools/blog/getBlogs.ts';
import { getArticles } from './tools/blog/getArticles.ts';
import { createArticle } from './tools/blog/createArticle.ts';

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

// Test connection tool
server.tool(
  'test_connection',
  'Test Shopify API connection and return shop info',
  {},
  async () => {
    try {
      const result = await shopifyClient.testConnection();
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Connection failed: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Get monthly ranking
server.tool(
  'get_monthly_ranking',
  'Get top-selling products for a specific month',
  {
    year: z.number().describe('Year (e.g., 2025)'),
    month: z.number().min(1).max(12).describe('Month (1-12)'),
    limit: z.number().optional().default(15).describe('Number of products to return (default: 15)'),
  },
  async ({ year, month, limit }) => {
    try {
      const result = await getMonthlyRanking(shopifyClient, year, month, limit);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Create collection
server.tool(
  'create_collection',
  'Create a new manual collection',
  {
    title: z.string().describe('Collection title'),
    handle: z.string().optional().describe('URL handle (auto-generated if not specified)'),
    descriptionHtml: z.string().optional().describe('Collection description in HTML'),
    sortOrder: z.enum(['MANUAL', 'BEST_SELLING', 'ALPHA_ASC', 'ALPHA_DESC', 'PRICE_ASC', 'PRICE_DESC', 'CREATED', 'CREATED_DESC'])
      .optional()
      .default('MANUAL')
      .describe('Product sort order (default: MANUAL for custom ordering)'),
  },
  async (params) => {
    try {
      const result = await createCollection(shopifyClient, params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Add products to collection
server.tool(
  'add_products_to_collection',
  'Add products to a collection and set their order',
  {
    collectionId: z.string().describe('Collection GID (e.g., gid://shopify/Collection/123)'),
    productIds: z.array(z.string()).describe('Array of product GIDs in desired order'),
  },
  async ({ collectionId, productIds }) => {
    try {
      const result = await addProductsToCollection(shopifyClient, collectionId, productIds);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Get collections
server.tool(
  'get_collections',
  'Search and list collections in the store',
  {
    first: z.number().optional().default(20).describe('Number of collections to return'),
    query: z.string().optional().describe('Search query (e.g., title:ranking)'),
  },
  async (params) => {
    try {
      const result = await getCollections(shopifyClient, params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Get collection detail
server.tool(
  'get_collection',
  'Get collection details including products',
  {
    collectionId: z.string().describe('Collection GID'),
    includeAllProducts: z.boolean().optional().default(false).describe('Fetch all products (pagination)'),
  },
  async ({ collectionId, includeAllProducts }) => {
    try {
      const result = await getCollection(shopifyClient, collectionId, { includeAllProducts });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Duplicate collection
server.tool(
  'duplicate_collection',
  'Duplicate an existing collection with all its products',
  {
    sourceCollectionId: z.string().describe('Source collection GID to duplicate'),
    newTitle: z.string().describe('Title for the new collection'),
    newHandle: z.string().optional().describe('Handle for the new collection'),
  },
  async (params) => {
    try {
      const result = await duplicateCollection(shopifyClient, params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Get blogs
server.tool(
  'get_blogs',
  'Get list of blogs in the store',
  {
    first: z.number().optional().default(10).describe('Number of blogs to return'),
  },
  async ({ first }) => {
    try {
      const result = await getBlogs(shopifyClient, first);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Get articles
server.tool(
  'get_articles',
  'Get articles from a blog',
  {
    blogId: z.string().optional().describe('Blog GID to filter by'),
    first: z.number().optional().default(10).describe('Number of articles to return'),
    query: z.string().optional().describe('Search query'),
  },
  async (params) => {
    try {
      const result = await getArticles(shopifyClient, params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  }
);

// Create article
server.tool(
  'create_article',
  'Create a new blog article',
  {
    blogId: z.string().describe('Blog GID'),
    title: z.string().describe('Article title'),
    contentHtml: z.string().describe('Article content in HTML'),
    author: z.string().optional().describe('Author name'),
    tags: z.array(z.string()).optional().describe('Article tags'),
    published: z.boolean().optional().default(false).describe('Whether to publish (default: draft)'),
    publishedAt: z.string().optional().describe('Scheduled publish date (ISO8601)'),
  },
  async (params) => {
    try {
      const result = await createArticle(shopifyClient, params);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text' as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
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
