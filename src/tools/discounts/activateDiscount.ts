import { ShopifyClient } from '../../shopify/client.ts';
import { checkUserErrors } from './helpers.ts';

const CODE_MUTATION = `
  mutation DiscountCodeActivate($id: ID!) {
    discountCodeActivate(id: $id) {
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
  mutation DiscountAutomaticActivate($id: ID!) {
    discountAutomaticActivate(id: $id) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic { title status }
          ... on DiscountAutomaticBxgy { status }
          ... on DiscountAutomaticFreeShipping { title status }
        }
      }
      userErrors { field message code }
    }
  }
`;

export async function activateDiscount(
  client: ShopifyClient,
  params: { id: string; type: 'code' | 'automatic' }
) {
  if (params.type === 'code') {
    const response = await client.request<{
      discountCodeActivate: {
        codeDiscountNode: { id: string; codeDiscount: unknown } | null;
        userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
      };
    }>(CODE_MUTATION, { id: params.id });
    checkUserErrors(response.discountCodeActivate.userErrors, 'Discount code activate');
    return response.discountCodeActivate.codeDiscountNode;
  }

  const response = await client.request<{
    discountAutomaticActivate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(AUTOMATIC_MUTATION, { id: params.id });
  checkUserErrors(response.discountAutomaticActivate.userErrors, 'Discount automatic activate');
  return response.discountAutomaticActivate.automaticDiscountNode;
}
