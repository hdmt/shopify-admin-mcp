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
  mutation DiscountAutomaticBxgyCreate($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) {
    discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBxgy {
            title
            status
            startsAt
            endsAt
            summary
          }
        }
      }
      userErrors { field message code }
    }
  }
`;

export interface CreateDiscountAutomaticBxgyParams {
  title?: string;
  startsAt: string;
  endsAt?: string;
  usesPerOrderLimit?: number;
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
}

export async function createDiscountAutomaticBxgy(
  client: ShopifyClient,
  params: CreateDiscountAutomaticBxgyParams
) {
  const input: Record<string, unknown> = {
    startsAt: params.startsAt,
    customerBuys: {
      value: buildBxgyBuysValue(params.customerBuys.value),
      items: buildDiscountItems(params.customerBuys.items),
    },
    customerGets: {
      value: buildBxgyGetsValue(params.customerGets.value),
      items: buildDiscountItems(params.customerGets.items),
    },
  };

  if (params.title !== undefined) input.title = params.title;
  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.usesPerOrderLimit !== undefined)
    input.usesPerOrderLimit = params.usesPerOrderLimit;
  if (params.combinesWith) input.combinesWith = params.combinesWith;

  const response = await client.request<{
    discountAutomaticBxgyCreate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { automaticBxgyDiscount: input });

  checkUserErrors(
    response.discountAutomaticBxgyCreate.userErrors,
    'Discount automatic bxgy create'
  );

  return response.discountAutomaticBxgyCreate.automaticDiscountNode;
}
