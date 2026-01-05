import type { ShopifyClient } from '../../shopify/client.ts';

interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: string;
  inventoryQuantity: number | null;
}

interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  status: string;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  images: ProductImage[];
  seo: {
    title: string | null;
    description: string | null;
  };
  onlineStoreUrl: string | null;
}

interface GetProductByIdResponse {
  product: ProductDetail | null;
}

interface GetProductByHandleResponse {
  productByHandle: ProductDetail | null;
}

const PRODUCT_FRAGMENT = `
  id
  title
  handle
  descriptionHtml
  status
  vendor
  productType
  tags
  createdAt
  updatedAt
  onlineStoreUrl
  seo {
    title
    description
  }
  variants(first: 50) {
    edges {
      node {
        id
        title
        sku
        price
        inventoryQuantity
      }
    }
  }
  images(first: 10) {
    edges {
      node {
        id
        url
        altText
      }
    }
  }
`;

function transformProduct(product: any): ProductDetail {
  return {
    ...product,
    variants: product.variants.edges.map((e: any) => e.node),
    images: product.images.edges.map((e: any) => e.node),
  };
}

export async function getProduct(
  client: ShopifyClient,
  params: {
    id?: string;
    handle?: string;
  }
): Promise<ProductDetail | null> {
  const { id, handle } = params;

  if (!id && !handle) {
    throw new Error('Either id or handle is required');
  }

  if (id) {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          ${PRODUCT_FRAGMENT}
        }
      }
    `;
    const response = await client.request<GetProductByIdResponse>(query, { id });
    return response.product ? transformProduct(response.product) : null;
  }

  const query = `
    query GetProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        ${PRODUCT_FRAGMENT}
      }
    }
  `;
  const response = await client.request<GetProductByHandleResponse>(query, { handle });
  return response.productByHandle ? transformProduct(response.productByHandle) : null;
}
