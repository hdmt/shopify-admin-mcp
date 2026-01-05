import type { ShopifyConfig, GraphQLResponse, ShopInfo } from './types.ts';

export class ShopifyClient {
  private endpoint: string;
  private restEndpoint: string;
  private accessToken: string;

  constructor(config?: ShopifyConfig) {
    const domain = config?.shopDomain ?? process.env.SHOPIFY_SHOP_DOMAIN;
    const token = config?.accessToken ?? process.env.SHOPIFY_ACCESS_TOKEN;

    if (!domain) {
      throw new Error('SHOPIFY_SHOP_DOMAIN is required');
    }
    if (!token) {
      throw new Error('SHOPIFY_ACCESS_TOKEN is required');
    }

    this.endpoint = `https://${domain}/admin/api/2024-10/graphql.json`;
    this.restEndpoint = `https://${domain}/admin/api/2024-10`;
    this.accessToken = token;
  }

  async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify API error: ${res.status} - ${text}`);
    }

    const json = (await res.json()) as GraphQLResponse<T>;

    if (json.errors && json.errors.length > 0) {
      throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`);
    }

    if (!json.data) {
      throw new Error('No data in response');
    }

    return json.data;
  }

  async testConnection(): Promise<ShopInfo> {
    const query = `
      query {
        shop {
          name
          email
          myshopifyDomain
          plan {
            displayName
          }
        }
      }
    `;

    return this.request<ShopInfo>(query);
  }

  async restGet<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.restEndpoint}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify REST API error: ${res.status} - ${text}`);
    }

    return (await res.json()) as T;
  }

  async restPut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.restEndpoint}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Shopify REST API error: ${res.status} - ${text}`);
    }

    return (await res.json()) as T;
  }
}
