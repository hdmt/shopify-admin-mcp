import type { ShopifyClient } from '../../shopify/client.ts';

const MUTATION = `
  mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        handle
        status
        vendor
        productType
        tags
        descriptionHtml
        updatedAt
      }
      userErrors { field message }
    }
  }
`;

export interface UpdateProductParams {
  id: string;
  title?: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  seo?: {
    title?: string;
    description?: string;
  };
}

export async function updateProduct(client: ShopifyClient, params: UpdateProductParams) {
  const input: Record<string, unknown> = { id: params.id };

  if (params.title !== undefined) input.title = params.title;
  if (params.descriptionHtml !== undefined) input.descriptionHtml = params.descriptionHtml;
  if (params.vendor !== undefined) input.vendor = params.vendor;
  if (params.productType !== undefined) input.productType = params.productType;
  if (params.tags !== undefined) input.tags = params.tags;
  if (params.status !== undefined) input.status = params.status;
  if (params.seo !== undefined) input.seo = params.seo;

  const data = await client.request<{ productUpdate: { product: unknown; userErrors: { field: string[]; message: string }[] } }>(
    MUTATION,
    { input }
  );

  const { product, userErrors } = data.productUpdate;

  if (userErrors.length > 0) {
    throw new Error(`Product update failed: ${userErrors.map((e) => `${e.field?.join('.')}: ${e.message}`).join(', ')}`);
  }

  return product;
}
