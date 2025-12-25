import { ShopifyClient } from '../../shopify/client.ts';

interface CollectionAddProductsResponse {
  collectionAddProducts: {
    collection: {
      id: string;
      productsCount: {
        count: number;
      };
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

interface CollectionReorderResponse {
  collectionReorderProducts: {
    job: {
      id: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

interface AddProductsResult {
  success: boolean;
  addedCount: number;
}

const COLLECTION_ADD_PRODUCTS_MUTATION = `
  mutation CollectionAddProducts($id: ID!, $productIds: [ID!]!) {
    collectionAddProducts(id: $id, productIds: $productIds) {
      collection {
        id
        productsCount {
          count
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const COLLECTION_REORDER_MUTATION = `
  mutation CollectionReorderProducts($id: ID!, $moves: [MoveInput!]!) {
    collectionReorderProducts(id: $id, moves: $moves) {
      job {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function addProductsToCollection(
  client: ShopifyClient,
  collectionId: string,
  productIds: string[]
): Promise<AddProductsResult> {
  // Add products to collection
  const addResponse = await client.request<CollectionAddProductsResponse>(
    COLLECTION_ADD_PRODUCTS_MUTATION,
    {
      id: collectionId,
      productIds,
    }
  );

  if (addResponse.collectionAddProducts.userErrors.length > 0) {
    throw new Error(
      `Add products failed: ${addResponse.collectionAddProducts.userErrors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  // Reorder products to match the input order
  const moves = productIds.map((productId, index) => ({
    id: productId,
    newPosition: String(index),
  }));

  const reorderResponse = await client.request<CollectionReorderResponse>(
    COLLECTION_REORDER_MUTATION,
    {
      id: collectionId,
      moves,
    }
  );

  if (reorderResponse.collectionReorderProducts.userErrors.length > 0) {
    console.warn(
      `Reorder warning: ${reorderResponse.collectionReorderProducts.userErrors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  return {
    success: true,
    addedCount: productIds.length,
  };
}
