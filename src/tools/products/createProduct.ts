import type { ShopifyClient } from '../../shopify/client.ts';

const MUTATION = `
  mutation ProductCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        status
        vendor
        productType
        tags
        descriptionHtml
        variants(first: 10) {
          edges {
            node {
              id
              title
              sku
              price
              compareAtPrice
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

export interface CreateProductVariantInput {
  price: string;
  sku?: string;
  compareAtPrice?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: 'KILOGRAMS' | 'GRAMS' | 'POUNDS' | 'OUNCES';
  requiresShipping?: boolean;
  taxable?: boolean;
  inventoryManagement?: 'SHOPIFY' | 'NOT_MANAGED';
}

export interface CreateProductParams {
  title: string;
  descriptionHtml?: string;
  vendor?: string;
  productType?: string;
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  variants?: CreateProductVariantInput[];
}

export async function createProduct(client: ShopifyClient, params: CreateProductParams) {
  const input: Record<string, unknown> = {
    title: params.title,
  };

  if (params.descriptionHtml !== undefined) input.descriptionHtml = params.descriptionHtml;
  if (params.vendor !== undefined) input.vendor = params.vendor;
  if (params.productType !== undefined) input.productType = params.productType;
  if (params.tags !== undefined) input.tags = params.tags;
  if (params.status !== undefined) input.status = params.status;
  if (params.variants !== undefined) input.variants = params.variants;

  const data = await client.request<{ productCreate: { product: unknown; userErrors: { field: string[]; message: string }[] } }>(
    MUTATION,
    { input }
  );

  const { product, userErrors } = data.productCreate;

  if (userErrors.length > 0) {
    throw new Error(`Product creation failed: ${userErrors.map((e) => `${e.field?.join('.')}: ${e.message}`).join(', ')}`);
  }

  return product;
}
