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
| `create_product` | Create a new product with optional variants |
| `update_product` | Update product info (title, description, status, SEO, etc.) |
| `upload_product_image` | Add images to a product from public URLs |
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

### Menu

| Tool | Description |
|------|-------------|
| `get_menus` | Get navigation menus with items |
| `update_menu` | Update a navigation menu |

### Discounts

| Tool | Description |
|------|-------------|
| `get_discounts` | List all discounts (code + automatic) |
| `get_discount` | Get a single discount detail by ID |
| `create_discount_code_basic` | Create a code discount (amount/% off) |
| `update_discount_code_basic` | Update a basic code discount |
| `create_discount_automatic_basic` | Create an auto-applied basic discount |
| `update_discount_automatic_basic` | Update an auto-applied basic discount |
| `create_discount_code_bxgy` | Create a BXGY (buy X get Y) code discount |
| `update_discount_code_bxgy` | Update a BXGY code discount |
| `create_discount_automatic_bxgy` | Create an auto-applied BXGY discount |
| `update_discount_automatic_bxgy` | Update an auto-applied BXGY discount |
| `create_discount_code_free_shipping` | Create a free shipping code discount |
| `update_discount_code_free_shipping` | Update a free shipping code discount |
| `create_discount_automatic_free_shipping` | Create an auto-applied free shipping discount |
| `update_discount_automatic_free_shipping` | Update an auto-applied free shipping discount |
| `activate_discount` | Activate (enable) a discount |
| `deactivate_discount` | Deactivate (disable) a discount |

## Required API Scopes

- `read_orders`
- `read_products`, `write_products`
- `read_content`, `write_content`
- `read_themes`, `write_themes`
- `read_online_store_navigation`, `write_online_store_navigation`
- `read_discounts`, `write_discounts`
