# Shopify Admin MCP

Shopify Admin API操作用のMCPサーバー

[English](README.md)

## セットアップ

```bash
npm install
```

## 環境変数

```
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

## Claude Desktop設定

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

## ツール一覧

### システム

| ツール | 説明 |
|--------|------|
| `test_connection` | API接続確認 |

### 商品

| ツール | 説明 |
|--------|------|
| `search_products` | 商品検索（タイトル、ベンダー等） |
| `get_product` | 商品詳細取得（ID or handle） |
| `get_monthly_ranking` | 月間売上ランキング取得 |

### コレクション

| ツール | 説明 |
|--------|------|
| `get_collections` | コレクション検索・一覧 |
| `get_collection` | コレクション詳細取得 |
| `create_collection` | コレクション作成 |
| `add_products_to_collection` | 商品追加・並び順設定 |
| `duplicate_collection` | コレクション複製 |

### ブログ

| ツール | 説明 |
|--------|------|
| `get_blogs` | ブログ一覧取得 |
| `get_articles` | 記事一覧取得 |
| `create_article` | 記事作成 |
| `update_article` | 記事更新 |

### テーマ

| ツール | 説明 |
|--------|------|
| `get_themes` | テーマ一覧取得 |
| `get_theme_asset` | テーマファイル取得 |
| `update_theme_asset` | テーマファイル作成・更新 |

## 必要なAPIスコープ

- `read_orders`
- `read_products`, `write_products`
- `read_content`, `write_content`
- `read_themes`, `write_themes`
