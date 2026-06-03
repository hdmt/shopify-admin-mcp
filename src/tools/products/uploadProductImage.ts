import type { ShopifyClient } from '../../shopify/client.ts';

const MUTATION = `
  mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        ... on MediaImage {
          id
          status
          image {
            url
            altText
          }
        }
      }
      mediaUserErrors { field message code }
      product { id title }
    }
  }
`;

export interface UploadProductImageParams {
  productId: string;
  images: Array<{
    originalSource: string;
    alt?: string;
  }>;
}

export async function uploadProductImage(client: ShopifyClient, params: UploadProductImageParams) {
  const media = params.images.map((img) => ({
    mediaContentType: 'IMAGE',
    originalSource: img.originalSource,
    alt: img.alt,
  }));

  const data = await client.request<{
    productCreateMedia: {
      media: Array<{ id: string; status: string; image?: { url: string; altText: string | null } }>;
      mediaUserErrors: Array<{ field: string[]; message: string; code: string }>;
      product: { id: string; title: string };
    };
  }>(MUTATION, { productId: params.productId, media });

  const { media: created, mediaUserErrors, product } = data.productCreateMedia;

  if (mediaUserErrors.length > 0) {
    throw new Error(`Image upload failed: ${mediaUserErrors.map((e) => `${e.field?.join('.')}: ${e.message}`).join(', ')}`);
  }

  return { product, media: created };
}
