import { ShopifyClient } from '../../shopify/client.ts';
import { getCollection } from './getCollection.ts';
import { createCollection } from './createCollection.ts';
import { addProductsToCollection } from './addProductsToCollection.ts';

interface DuplicateCollectionResult {
  sourceCollection: {
    id: string;
    title: string;
  };
  newCollection: {
    collectionId: string;
    handle: string;
    adminUrl: string;
  };
  productsCount: number;
}

export async function duplicateCollection(
  client: ShopifyClient,
  params: {
    sourceCollectionId: string;
    newTitle: string;
    newHandle?: string;
  }
): Promise<DuplicateCollectionResult> {
  // 1. Get source collection with all products
  const source = await getCollection(client, params.sourceCollectionId, {
    includeAllProducts: true,
  });

  // 2. Create new collection
  const newCollection = await createCollection(client, {
    title: params.newTitle,
    handle: params.newHandle,
    descriptionHtml: source.descriptionHtml,
  });

  // 3. Add products to new collection (preserving order)
  if (source.products.length > 0) {
    const productIds = source.products.map((p) => p.id);
    await addProductsToCollection(client, newCollection.collectionId, productIds);
  }

  return {
    sourceCollection: {
      id: source.id,
      title: source.title,
    },
    newCollection,
    productsCount: source.products.length,
  };
}
