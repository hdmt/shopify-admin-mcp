import { ShopifyClient } from '../../shopify/client.ts';

interface CollectionResponse {
  collection: {
    id: string;
    title: string;
    handle: string;
    descriptionHtml: string;
    productsCount: {
      count: number;
    };
    products: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          handle: string;
        };
      }>;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  } | null;
}

interface GetCollectionResult {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  productsCount: number;
  products: Array<{
    id: string;
    title: string;
    handle: string;
  }>;
}

const GET_COLLECTION_QUERY = `
  query GetCollection($id: ID!, $productsFirst: Int!, $after: String) {
    collection(id: $id) {
      id
      title
      handle
      descriptionHtml
      productsCount {
        count
      }
      products(first: $productsFirst, after: $after) {
        edges {
          node {
            id
            title
            handle
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export async function getCollection(
  client: ShopifyClient,
  collectionId: string,
  options?: { includeAllProducts?: boolean }
): Promise<GetCollectionResult> {
  const allProducts: Array<{ id: string; title: string; handle: string }> = [];
  let hasNextPage = true;
  let cursor: string | null = null;
  let collectionData: CollectionResponse['collection'] = null;

  while (hasNextPage) {
    const response = await client.request<CollectionResponse>(GET_COLLECTION_QUERY, {
      id: collectionId,
      productsFirst: 50,
      after: cursor,
    });

    if (!response.collection) {
      throw new Error(`Collection not found: ${collectionId}`);
    }

    collectionData = response.collection;

    for (const edge of response.collection.products.edges) {
      allProducts.push(edge.node);
    }

    if (!options?.includeAllProducts) {
      break;
    }

    hasNextPage = response.collection.products.pageInfo.hasNextPage;
    cursor = response.collection.products.pageInfo.endCursor;
  }

  return {
    id: collectionData!.id,
    title: collectionData!.title,
    handle: collectionData!.handle,
    descriptionHtml: collectionData!.descriptionHtml,
    productsCount: collectionData!.productsCount.count,
    products: allProducts,
  };
}
