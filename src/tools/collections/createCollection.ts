import { ShopifyClient } from '../../shopify/client.ts';

interface CollectionCreateResponse {
  collectionCreate: {
    collection: {
      id: string;
      handle: string;
      title: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

interface CreateCollectionResult {
  collectionId: string;
  handle: string;
  adminUrl: string;
}

const COLLECTION_CREATE_MUTATION = `
  mutation CollectionCreate($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export type CollectionSortOrder =
  | 'MANUAL'
  | 'BEST_SELLING'
  | 'ALPHA_ASC'
  | 'ALPHA_DESC'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'CREATED'
  | 'CREATED_DESC';

export async function createCollection(
  client: ShopifyClient,
  params: {
    title: string;
    handle?: string;
    descriptionHtml?: string;
    sortOrder?: CollectionSortOrder;
  }
): Promise<CreateCollectionResult> {
  const input: Record<string, unknown> = {
    title: params.title,
    sortOrder: params.sortOrder ?? 'MANUAL',
  };

  if (params.handle) input.handle = params.handle;
  if (params.descriptionHtml) input.descriptionHtml = params.descriptionHtml;
  // Note: published is not supported in CollectionInput, collections are published by default

  const response = await client.request<CollectionCreateResponse>(
    COLLECTION_CREATE_MUTATION,
    { input }
  );

  if (response.collectionCreate.userErrors.length > 0) {
    throw new Error(
      `Collection create failed: ${response.collectionCreate.userErrors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  if (!response.collectionCreate.collection) {
    throw new Error('Collection create failed: no collection returned');
  }

  const collection = response.collectionCreate.collection;
  const numericId = collection.id.split('/').pop();

  return {
    collectionId: collection.id,
    handle: collection.handle,
    adminUrl: `https://admin.shopify.com/store/bonz-kousui/collections/${numericId}`,
  };
}
