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
  mutation DiscountCodeBxgyUpdate($id: ID!, $bxgyCodeDiscount: DiscountCodeBxgyInput!) {
    discountCodeBxgyUpdate(id: $id, bxgyCodeDiscount: $bxgyCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBxgy {
            title
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

export interface UpdateDiscountCodeBxgyParams {
  id: string;
  title?: string;
  code?: string;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  usesPerOrderLimit?: number;
  appliesOncePerCustomer?: boolean;
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
  customerSelection?: DiscountCustomerSelectionInput;
}

export async function updateDiscountCodeBxgy(
  client: ShopifyClient,
  params: UpdateDiscountCodeBxgyParams
) {
  const { id, ...rest } = params;
  const input: Record<string, unknown> = {};

  if (rest.title !== undefined) input.title = rest.title;
  if (rest.code !== undefined) input.code = rest.code;
  if (rest.startsAt !== undefined) input.startsAt = rest.startsAt;
  if (rest.endsAt !== undefined) input.endsAt = rest.endsAt;
  if (rest.usageLimit !== undefined) input.usageLimit = rest.usageLimit;
  if (rest.usesPerOrderLimit !== undefined) input.usesPerOrderLimit = rest.usesPerOrderLimit;
  if (rest.appliesOncePerCustomer !== undefined)
    input.appliesOncePerCustomer = rest.appliesOncePerCustomer;
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
  if (rest.customerSelection)
    input.customerSelection = buildCustomerSelection(rest.customerSelection);

  const response = await client.request<{
    discountCodeBxgyUpdate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, bxgyCodeDiscount: input });

  checkUserErrors(response.discountCodeBxgyUpdate.userErrors, 'Discount code bxgy update');

  return response.discountCodeBxgyUpdate.codeDiscountNode;
}
