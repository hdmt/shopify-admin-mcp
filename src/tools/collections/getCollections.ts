import { ShopifyClient } from '../../shopify/client.ts';

interface CollectionsResponse {
  collections: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        productsCount: {
          count: number;
        };
        updatedAt: string;
      };
    }>;
  };
}

interface GetCollectionsResult {
  collections: Array<{
    id: string;
    title: string;
    handle: string;
    productsCount: number;
    updatedAt: string;
  }>;
}

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $query: String) {
    collections(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          productsCount {
            count
          }
          updatedAt
        }
      }
    }
  }
`;

export async function getCollections(
  client: ShopifyClient,
  params: {
    first?: number;
    query?: string;
  }
): Promise<GetCollectionsResult> {
  const response = await client.request<CollectionsResponse>(GET_COLLECTIONS_QUERY, {
    first: params.first ?? 20,
    query: params.query || null,
  });

  return {
    collections: response.collections.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      productsCount: edge.node.productsCount.count,
      updatedAt: edge.node.updatedAt,
    })),
  };
}
