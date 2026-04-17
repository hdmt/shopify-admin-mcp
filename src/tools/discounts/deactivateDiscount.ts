import { ShopifyClient } from '../../shopify/client.ts';
import { checkUserErrors } from './helpers.ts';

const CODE_MUTATION = `
  mutation DiscountCodeDeactivate($id: ID!) {
    discountCodeDeactivate(id: $id) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic { title status }
          ... on DiscountCodeBxgy { title status }
          ... on DiscountCodeFreeShipping { title status }
        }
      }
      userErrors { field message code }
    }
  }
`;

const AUTOMATIC_MUTATION = `
  mutation DiscountAutomaticDeactivate($id: ID!) {
    discountAutomaticDeactivate(id: $id) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic { title status }
          ... on DiscountAutomaticBxgy { title status }
          ... on DiscountAutomaticFreeShipping { title status }
        }
      }
      userErrors { field message code }
    }
  }
`;

export async function deactivateDiscount(
  client: ShopifyClient,
  params: { id: string; type: 'code' | 'automatic' }
) {
  if (params.type === 'code') {
    const response = await client.request<{
      discountCodeDeactivate: {
        codeDiscountNode: { id: string; codeDiscount: unknown } | null;
        userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
      };
    }>(CODE_MUTATION, { id: params.id });
    checkUserErrors(response.discountCodeDeactivate.userErrors, 'Discount code deactivate');
    return response.discountCodeDeactivate.codeDiscountNode;
  }

  const response = await client.request<{
    discountAutomaticDeactivate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(AUTOMATIC_MUTATION, { id: params.id });
  checkUserErrors(
    response.discountAutomaticDeactivate.userErrors,
    'Discount automatic deactivate'
  );
  return response.discountAutomaticDeactivate.automaticDiscountNode;
}
