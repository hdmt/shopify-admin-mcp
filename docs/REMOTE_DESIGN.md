# shopify-admin-mcp-remote 設計書

## 概要

既存の [shopify-admin-mcp](https://github.com/hdmt/shopify-admin-mcp) (Stdio / ローカル専用) を、
Claude.ai (Web) からリモートアクセスできる MCP サーバーとして再構築する。

## アーキテクチャ

```
┌─────────────┐     HTTPS (Streamable HTTP)     ┌──────────────────────────┐
│  Claude.ai  │ ◄──────────────────────────────► │  MCP Remote Server       │
│  (Connector)│     OAuth 2.1 + DCR              │  (Cloudflare Workers)    │
└─────────────┘                                  └──────┬───────────────────┘
                                                        │
                  ┌─────────────────────────────────────┘
                  │
                  ▼
        ┌──────────────────┐          ┌─────────────────────┐
        │  OAuth Provider  │ ────────►│  Shopify OAuth       │
        │  (workers-oauth- │          │  (Identity Provider) │
        │   provider)      │          └─────────────────────┘
        └──────────────────┘                    │
                                                ▼
                                      ┌─────────────────────┐
                                      │  Shopify Admin API   │
                                      │  (GraphQL + REST)    │
                                      └─────────────────────┘
```

## 技術選定

| コンポーネント | 技術 | 理由 |
|--------------|------|------|
| ホスティング | Cloudflare Workers | MCP SDK 組み込みサポート、エッジ実行、無料枠大 |
| トランスポート | Streamable HTTP | MCP 仕様準拠、Claude.ai Connector 対応 |
| OAuth Provider | workers-oauth-provider | OAuth 2.1 + DCR (RFC 7591) 実装済み |
| 認証 (IdP) | Shopify OAuth | ストアオーナー/スタッフの既存アカウントを流用 |
| トークンストレージ | Cloudflare KV | Workers 統合済み、無料枠十分 |
| スキーマバリデーション | Zod | 既存プロジェクトと統一 |
| MCP SDK | @modelcontextprotocol/sdk | 既存プロジェクトと統一 |

## 認証設計

### トークン戦略

**Online Access Token** を採用する。

| 項目 | 仕様 |
|------|------|
| トークン種類 | Shopify Online Access Token |
| 有効期限 | 24時間 (Shopify 固定仕様) |
| 粒度 | ユーザー (スタッフ) 単位 |
| 権限 | Shopify 管理画面で設定したスタッフ権限に準拠 |
| 再認証 | 期限切れ時、Claude.ai が自動的に OAuth フローを再起動 |

### 認証フロー

```
1. ユーザーが Claude.ai Settings → Connectors でMCPサーバーURLを登録
   URL: https://shopify-admin-mcp-remote.<account>.workers.dev/mcp
   OAuth Client ID: 空欄 (DCR で自動登録)
   OAuth Client Secret: 空欄

2. Claude.ai が /.well-known/oauth-authorization-server を取得

3. Claude.ai が DCR エンドポイントで動的クライアント登録

4. ユーザーがツール利用時:
   Claude.ai → MCP Server /authorize へリダイレクト
                    ↓
   MCP Server: ストアドメイン入力画面を表示
                    ↓
   MCP Server → Shopify OAuth 認可画面へリダイレクト
                    ↓
   ユーザーが Shopify でログイン + アプリ認可
                    ↓
   Shopify → MCP Server /callback に auth code を返却
                    ↓
   MCP Server が auth code → Shopify Online Access Token に交換
                    ↓
   MCP Server が独自の access token を Claude.ai に発行
                    ↓
   トークン情報を Cloudflare KV に保存
                    ↓
   Claude.ai に戻り、ツール実行結果を表示

5. 2回目以降 (24時間以内):
   Bearer token 付きで直接ツール実行 (再認証なし)
```

### KV データ構造

```typescript
// セッション情報 (キー: "session:{mcp_token_hash}")
interface SessionData {
  shopDomain: string;           // "my-shop.myshopify.com"
  shopifyToken: string;         // Online Access Token (shpua_xxxx)
  staffId: string;              // "gid://shopify/StaffMember/123"
  staffName: string;            // "田中太郎"
  scopes: string[];             // ["read_products", "read_orders", ...]
  createdAt: string;            // ISO 8601
  expiresAt: string;            // 24時間後
}

// DCR クライアント情報 (キー: "client:{client_id}")
interface ClientRegistration {
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  clientName: string;
  registeredAt: string;
}
```

## マルチストア対応

- **MCP サーバー URL: 1つ** (全ストア共通)
- **Shopify App: 1つ** (非公開アプリとして配布)
- ログイン時にストアドメインを指定 → 該当ストアの Shopify OAuth へ遷移
- ストアごとのセットアップ: 各ストアオーナーがアプリをインストールするだけ

```
同一 MCP Server URL
  ├── Store A のスタッフ → Store A の Shopify OAuth → Store A の API
  ├── Store B のスタッフ → Store B の Shopify OAuth → Store B の API
  └── Store C のスタッフ → Store C の Shopify OAuth → Store C の API
```

## Claude.ai Connector 設定

| フィールド | 値 |
|-----------|-----|
| 名前 | Shopify Admin (任意) |
| リモートMCPサーバーURL | `https://shopify-admin-mcp-remote.<account>.workers.dev/mcp` |
| OAuth Client ID | 空欄 (DCR で自動登録) |
| OAuth クライアントシークレット | 空欄 |

## 提供ツール (19個)

既存の shopify-admin-mcp から全ツールを移植する。

### システム
- `test_connection` - API 接続テスト

### 商品 (Products)
- `search_products` - 商品検索
- `get_product` - 商品詳細取得
- `get_monthly_ranking` - 月間売上ランキング

### コレクション (Collections)
- `get_collections` - コレクション一覧
- `get_collection` - コレクション詳細
- `create_collection` - コレクション作成
- `add_products_to_collection` - 商品追加
- `duplicate_collection` - コレクション複製

### ブログ (Blog)
- `get_blogs` - ブログ一覧
- `get_articles` - 記事一覧
- `create_article` - 記事作成
- `update_article` - 記事更新

### テーマ (Themes)
- `get_themes` - テーマ一覧
- `get_theme_asset` - テーマファイル取得
- `update_theme_asset` - テーマファイル更新

### 注文 (Orders)
- `get_monthly_ranking` (注文データを使用)

## Shopify API

| 項目 | 値 |
|------|-----|
| API バージョン | 2024-10 |
| GraphQL エンドポイント | `https://{domain}/admin/api/2024-10/graphql.json` |
| REST エンドポイント | `https://{domain}/admin/api/2024-10` |
| 必要スコープ | `read_products`, `write_products`, `read_orders`, `read_content`, `write_content`, `read_themes`, `write_themes` |

## プロジェクト構成

```
shopify-admin-mcp-remote/
├── src/
│   ├── index.ts                    # Cloudflare Worker エントリーポイント
│   ├── mcp-server.ts               # MCP Server 定義 (ツール登録)
│   ├── auth/
│   │   ├── handler.ts              # OAuth Provider 設定 (workers-oauth-provider)
│   │   ├── shopify-oauth.ts        # Shopify OAuth 連携 (認可・トークン交換)
│   │   └── token-store.ts          # KV ベースのトークン/セッション管理
│   ├── shopify/
│   │   ├── client.ts               # Shopify API クライアント (既存から移植)
│   │   └── types.ts                # 型定義 (既存から移植)
│   └── tools/                      # ツール群 (既存から移植)
│       ├── blog/
│       │   └── index.ts
│       ├── collections/
│       │   └── index.ts
│       ├── orders/
│       │   └── index.ts
│       ├── products/
│       │   └── index.ts
│       └── themes/
│           └── index.ts
├── wrangler.toml                   # Cloudflare Workers 設定
├── package.json
├── tsconfig.json
├── DESIGN.md                       # この設計書
├── CLAUDE.md                       # Claude Code 用コンテキスト
└── .gitignore
```

## Shopify Partner アプリ設定

Shopify Partner Dashboard で非公開アプリを作成する。

| 設定項目 | 値 |
|---------|-----|
| App name | Shopify Admin MCP Remote |
| App URL | `https://shopify-admin-mcp-remote.<account>.workers.dev` |
| Redirect URL | `https://shopify-admin-mcp-remote.<account>.workers.dev/callback` |
| Access mode | Online (per-user) |
| Distribution | 非公開 (リンク配布) |

## ランニングコスト

| コンポーネント | 月額 |
|--------------|------|
| Cloudflare Workers (Free) | $0 |
| Cloudflare KV (Free) | $0 |
| Shopify Partner アカウント | $0 |
| Shopify Admin API | $0 |
| workers.dev サブドメイン | $0 |
| **合計** | **$0/月** |

※ Cloudflare Workers Free: 10万リクエスト/日、KV Free: 読取10万/日・書込1,000/日
※ 通常利用 (数名・1日数十回) では Free 枠で十分

## 実装ステップ

1. [ ] Shopify Partner Dashboard でアプリ作成 + OAuth credentials 取得
2. [ ] Cloudflare Workers プロジェクト初期化 (wrangler)
3. [ ] OAuth Provider 実装 (workers-oauth-provider + DCR)
4. [ ] Shopify OAuth 連携実装 (認可・コールバック・トークン交換)
5. [ ] KV セットアップ (セッション/トークン管理)
6. [ ] 既存ツール移植 (shopify-admin-mcp → Streamable HTTP)
7. [ ] ShopifyClient をリクエストコンテキスト対応に変更
8. [ ] Cloudflare Workers へデプロイ
9. [ ] Claude.ai Connectors でテスト
