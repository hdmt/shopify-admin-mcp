import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildDiscountItems,
  buildDiscountValue,
  buildMinimumRequirement,
  checkUserErrors,
  type DiscountItemsInput,
  type DiscountMinimumRequirementInput,
  type DiscountValueInput,
} from './helpers.ts';

const MUTATION = `
  mutation DiscountAutomaticBasicUpdate($id: ID!, $automaticBasicDiscount: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $automaticBasicDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic {
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

export interface UpdateDiscountAutomaticBasicParams {
  id: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerGets?: {
    value: DiscountValueInput;
    items: DiscountItemsInput;
  };
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function updateDiscountAutomaticBasic(
  client: ShopifyClient,
  params: UpdateDiscountAutomaticBasicParams
) {
  const { id, ...rest } = params;
  const input: Record<string, unknown> = {};

  if (rest.title !== undefined) input.title = rest.title;
  if (rest.startsAt !== undefined) input.startsAt = rest.startsAt;
  if (rest.endsAt !== undefined) input.endsAt = rest.endsAt;
  if (rest.combinesWith) input.combinesWith = rest.combinesWith;
  if (rest.customerGets) {
    input.customerGets = {
      value: buildDiscountValue(rest.customerGets.value),
      items: buildDiscountItems(rest.customerGets.items),
    };
  }
  if (rest.minimumRequirement) input.minimumRequirement = buildMinimumRequirement(rest.minimumRequirement);

  const response = await client.request<{
    discountAutomaticBasicUpdate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, automaticBasicDiscount: input });

  checkUserErrors(
    response.discountAutomaticBasicUpdate.userErrors,
    'Discount automatic basic update'
  );

  return response.discountAutomaticBasicUpdate.automaticDiscountNode;
}
