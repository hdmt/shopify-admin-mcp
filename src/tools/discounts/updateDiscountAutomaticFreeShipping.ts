import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildMinimumRequirement,
  checkUserErrors,
  type DiscountMinimumRequirementInput,
} from './helpers.ts';
import {
  buildShippingDestination,
  type ShippingDestinationInput,
} from './createDiscountCodeFreeShipping.ts';

const MUTATION = `
  mutation DiscountAutomaticFreeShippingUpdate($id: ID!, $freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
    discountAutomaticFreeShippingUpdate(id: $id, freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticFreeShipping {
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

export interface UpdateDiscountAutomaticFreeShippingParams {
  id: string;
  title?: string;
  startsAt?: string;
  endsAt?: string;
  maximumShippingPrice?: number;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  destination?: ShippingDestinationInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function updateDiscountAutomaticFreeShipping(
  client: ShopifyClient,
  params: UpdateDiscountAutomaticFreeShippingParams
) {
  const { id, ...rest } = params;
  const input: Record<string, unknown> = {};

  if (rest.title !== undefined) input.title = rest.title;
  if (rest.startsAt !== undefined) input.startsAt = rest.startsAt;
  if (rest.endsAt !== undefined) input.endsAt = rest.endsAt;
  if (rest.maximumShippingPrice !== undefined)
    input.maximumShippingPrice = rest.maximumShippingPrice;
  if (rest.combinesWith) input.combinesWith = rest.combinesWith;
  if (rest.destination) input.destination = buildShippingDestination(rest.destination);
  if (rest.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(rest.minimumRequirement);

  const response = await client.request<{
    discountAutomaticFreeShippingUpdate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, freeShippingAutomaticDiscount: input });

  checkUserErrors(
    response.discountAutomaticFreeShippingUpdate.userErrors,
    'Discount automatic free shipping update'
  );

  return response.discountAutomaticFreeShippingUpdate.automaticDiscountNode;
}
