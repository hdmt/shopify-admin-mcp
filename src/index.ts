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
import { updateArticle } from './tools/blog/updateArticle.ts';
import { getThemes } from './tools/themes/getThemes.ts';
import { getThemeAsset } from './tools/themes/getThemeAsset.ts';
import { updateThemeAsset } from './tools/themes/updateThemeAsset.ts';
import { searchProducts } from './tools/products/searchProducts.ts';
import { getProduct } from './tools/products/getProduct.ts';
import { getMenus } from './tools/menus/getMenus.ts';
import { updateMenu } from './tools/menus/updateMenu.ts';

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
    handle: z.string().optional().describe('URL handle (slug)'),
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

// Update article
server.tool(
  'update_article',
  'Update an existing blog article',
  {
    id: z.string().describe('Article GID'),
    title: z.string().optional().describe('New title'),
    contentHtml: z.string().optional().describe('New content in HTML'),
    handle: z.string().optional().describe('URL handle (slug)'),
    author: z.string().optional().describe('Author name'),
    tags: z.array(z.string()).optional().describe('Article tags'),
    published: z.boolean().optional().describe('Whether to publish'),
    publishedAt: z.string().optional().describe('Publish date (ISO8601)'),
  },
  async (params) => {
    try {
      const result = await updateArticle(shopifyClient, params);
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

// Get themes
server.tool(
  'get_themes',
  'Get list of themes in the store',
  {},
  async () => {
    try {
      const result = await getThemes(shopifyClient);
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

// Get theme asset
server.tool(
  'get_theme_asset',
  'Get a specific file content from a theme',
  {
    themeId: z.number().describe('Theme ID'),
    key: z.string().describe('Asset key (e.g., sections/featured-collection.liquid)'),
  },
  async ({ themeId, key }) => {
    try {
      const result = await getThemeAsset(shopifyClient, themeId, key);
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

// Update theme asset
server.tool(
  'update_theme_asset',
  'Create or update a file in a theme',
  {
    themeId: z.number().describe('Theme ID'),
    key: z.string().describe('Asset key (e.g., sections/featured-collection-ranking.liquid)'),
    value: z.string().describe('File content'),
  },
  async ({ themeId, key, value }) => {
    try {
      const result = await updateThemeAsset(shopifyClient, themeId, key, value);
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

// Search products
server.tool(
  'search_products',
  'Search products by title, vendor, product type, etc.',
  {
    query: z.string().optional().describe('Search query (e.g., "title:青汁" or "vendor:メーカー名")'),
    first: z.number().optional().default(20).describe('Number of products to return'),
  },
  async (params) => {
    try {
      const result = await searchProducts(shopifyClient, params);
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

// Get product detail
server.tool(
  'get_product',
  'Get product details by ID or handle',
  {
    id: z.string().optional().describe('Product GID (e.g., gid://shopify/Product/123)'),
    handle: z.string().optional().describe('Product handle (slug)'),
  },
  async (params) => {
    try {
      const result = await getProduct(shopifyClient, params);
      if (!result) {
        return {
          content: [{ type: 'text' as const, text: 'Product not found' }],
        };
      }
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

// Get menus
server.tool(
  'get_menus',
  'Get navigation menus with their items',
  {
    first: z.number().optional().default(10).describe('Number of menus to return'),
  },
  async ({ first }) => {
    try {
      const result = await getMenus(shopifyClient, first);
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

// Update menu
server.tool(
  'update_menu',
  'Update a navigation menu (title and items)',
  {
    id: z.string().describe('Menu GID (e.g., gid://shopify/Menu/123)'),
    title: z.string().describe('Menu title'),
    items: z.array(z.object({
      title: z.string().describe('Menu item title'),
      type: z.string().optional().describe('Item type (e.g., HTTP, COLLECTION, PRODUCT)'),
      url: z.string().optional().describe('URL for HTTP type items'),
      resourceId: z.string().optional().describe('Resource GID for COLLECTION/PRODUCT type items'),
      items: z.array(z.object({
        title: z.string(),
        type: z.string().optional(),
        url: z.string().optional(),
        resourceId: z.string().optional(),
      })).optional().describe('Nested menu items'),
    })).describe('Menu items'),
  },
  async (params) => {
    try {
      const result = await updateMenu(shopifyClient, params);
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
