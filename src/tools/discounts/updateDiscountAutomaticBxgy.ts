import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildBxgyBuysValue,
  buildBxgyGetsValue,
  buildDiscountItems,
  checkUserErrors,
  type BxgyBuysValue,
  type BxgyGetsValue,
  type DiscountItemsInput,
} from './helpers.ts';

const MUTATION = `
  mutation DiscountAutomaticBxgyUpdate($id: ID!, $automaticBxgyDiscount: DiscountAutomaticBxgyInput!) {
    discountAutomaticBxgyUpdate(id: $id, automaticBxgyDiscount: $automaticBxgyDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBxgy {
            status
            startsAt
            endsAt
          }
        }
      }
      userErrors { field message code }
    }
  }
`;

export interface UpdateDiscountAutomaticBxgyParams {
  id: string;
  startsAt?: string;
  endsAt?: string;
  usesPerOrderLimit?: number;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerBuys?: {
    value: BxgyBuysValue;
    items: DiscountItemsInput;
  };
  customerGets?: {
    value: BxgyGetsValue;
    items: DiscountItemsInput;
  };
}

export async function updateDiscountAutomaticBxgy(
  client: ShopifyClient,
  params: UpdateDiscountAutomaticBxgyParams
) {
  const { id, ...rest } = params;
  const input: Record<string, unknown> = {};

  if (rest.startsAt !== undefined) input.startsAt = rest.startsAt;
  if (rest.endsAt !== undefined) input.endsAt = rest.endsAt;
  if (rest.usesPerOrderLimit !== undefined) input.usesPerOrderLimit = rest.usesPerOrderLimit;
  if (rest.combinesWith) input.combinesWith = rest.combinesWith;
  if (rest.customerBuys) {
    input.customerBuys = {
      value: buildBxgyBuysValue(rest.customerBuys.value),
      items: buildDiscountItems(rest.customerBuys.items),
    };
  }
  if (rest.customerGets) {
    input.customerGets = {
      value: buildBxgyGetsValue(rest.customerGets.value),
      items: buildDiscountItems(rest.customerGets.items),
    };
  }

  const response = await client.request<{
    discountAutomaticBxgyUpdate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, automaticBxgyDiscount: input });

  checkUserErrors(
    response.discountAutomaticBxgyUpdate.userErrors,
    'Discount automatic bxgy update'
  );

  return response.discountAutomaticBxgyUpdate.automaticDiscountNode;
}
