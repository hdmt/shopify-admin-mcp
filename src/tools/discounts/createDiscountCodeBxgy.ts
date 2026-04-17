import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildBxgyBuysValue,
  buildBxgyGetsValue,
  buildCustomerSelection,
  buildDiscountItems,
  checkUserErrors,
  type BxgyBuysValue,
  type BxgyGetsValue,
  type DiscountCustomerSelectionInput,
  type DiscountItemsInput,
} from './helpers.ts';

const MUTATION = `
  mutation DiscountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
    discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBxgy {
            title
            status
            startsAt
            endsAt
            codes(first: 5) { edges { node { code } } }
          }
        }
      }
      userErrors { field message code }
    }
  }
`;

export interface CreateDiscountCodeBxgyParams {
  title: string;
  code: string;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  usesPerOrderLimit?: number;
  appliesOncePerCustomer?: boolean;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerBuys: {
    value: BxgyBuysValue;
    items: DiscountItemsInput;
  };
  customerGets: {
    value: BxgyGetsValue;
    items: DiscountItemsInput;
  };
  customerSelection: DiscountCustomerSelectionInput;
}

export async function createDiscountCodeBxgy(
  client: ShopifyClient,
  params: CreateDiscountCodeBxgyParams
) {
  const input: Record<string, unknown> = {
    title: params.title,
    code: params.code,
    startsAt: params.startsAt,
    customerBuys: {
      value: buildBxgyBuysValue(params.customerBuys.value),
      items: buildDiscountItems(params.customerBuys.items),
    },
    customerGets: {
      value: buildBxgyGetsValue(params.customerGets.value),
      items: buildDiscountItems(params.customerGets.items),
    },
    customerSelection: buildCustomerSelection(params.customerSelection),
  };

  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.usageLimit !== undefined) input.usageLimit = params.usageLimit;
  if (params.usesPerOrderLimit !== undefined)
    input.usesPerOrderLimit = params.usesPerOrderLimit;
  if (params.appliesOncePerCustomer !== undefined)
    input.appliesOncePerCustomer = params.appliesOncePerCustomer;
  if (params.combinesWith) input.combinesWith = params.combinesWith;

  const response = await client.request<{
    discountCodeBxgyCreate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { bxgyCodeDiscount: input });

  checkUserErrors(response.discountCodeBxgyCreate.userErrors, 'Discount code bxgy create');

  return response.discountCodeBxgyCreate.codeDiscountNode;
}
