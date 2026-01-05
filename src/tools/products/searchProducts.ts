import type { ShopifyClient } from '../../shopify/client.ts';

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  createdAt: string;
  updatedAt: string;
}

interface SearchProductsResponse {
  products: {
    edges: Array<{
      node: ProductNode;
    }>;
    pageInfo: {
      hasNextPage: boolean;
    };
  };
}

export interface SearchProductsResult {
  products: ProductNode[];
  hasNextPage: boolean;
}

export async function searchProducts(
  client: ShopifyClient,
  params: {
    query?: string;
    first?: number;
  }
): Promise<SearchProductsResult> {
  const { query, first = 20 } = params;

  const graphqlQuery = `
    query SearchProducts($query: String, $first: Int!) {
      products(query: $query, first: $first) {
        edges {
          node {
            id
            title
            handle
            status
            vendor
            productType
            createdAt
            updatedAt
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;

  const response = await client.request<SearchProductsResponse>(graphqlQuery, {
    query,
    first,
  });

  return {
    products: response.products.edges.map((edge) => edge.node),
    hasNextPage: response.products.pageInfo.hasNextPage,
  };
}
