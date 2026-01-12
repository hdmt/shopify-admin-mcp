# Shopify Admin MCP

MCP server for Shopify Admin API operations

[日本語版はこちら](README.ja.md)

## Setup

```bash
npm install
```

## Environment Variables

```
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

## Claude Desktop Configuration

```json
{
  "mcpServers": {
    "shopify-admin": {
      "command": "node",
      "args": ["--experimental-strip-types", "/path/to/shopify-admin-mcp/src/index.ts"],
      "env": {
        "SHOPIFY_SHOP_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_xxxxx"
      }
    }
  }
}
```

## Available Tools

### System

| Tool | Description |
|------|-------------|
| `test_connection` | Test API connection |

### Products

| Tool | Description |
|------|-------------|
| `search_products` | Search products (by title, vendor, etc.) |
| `get_product` | Get product details (by ID or handle) |
| `get_monthly_ranking` | Get monthly sales ranking |

### Collections

| Tool | Description |
|------|-------------|
| `get_collections` | Search and list collections |
| `get_collection` | Get collection details |
| `create_collection` | Create a collection |
| `add_products_to_collection` | Add products and set sort order |
| `duplicate_collection` | Duplicate a collection |

### Blog

| Tool | Description |
|------|-------------|
| `get_blogs` | Get blog list |
| `get_articles` | Get article list |
| `create_article` | Create an article |
| `update_article` | Update an article |

### Theme

| Tool | Description |
|------|-------------|
| `get_themes` | Get theme list |
| `get_theme_asset` | Get theme file |
| `update_theme_asset` | Create or update theme file |

## Required API Scopes

- `read_orders`
- `read_products`, `write_products`
- `read_content`, `write_content`
- `read_themes`, `write_themes`
