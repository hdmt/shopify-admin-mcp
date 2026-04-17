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
  mutation DiscountAutomaticFreeShippingCreate($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
    discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
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

export interface CreateDiscountAutomaticFreeShippingParams {
  title: string;
  startsAt: string;
  endsAt?: string;
  maximumShippingPrice?: number;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  destination: ShippingDestinationInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function createDiscountAutomaticFreeShipping(
  client: ShopifyClient,
  params: CreateDiscountAutomaticFreeShippingParams
) {
  const input: Record<string, unknown> = {
    title: params.title,
    startsAt: params.startsAt,
    destination: buildShippingDestination(params.destination),
  };

  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.maximumShippingPrice !== undefined)
    input.maximumShippingPrice = params.maximumShippingPrice;
  if (params.combinesWith) input.combinesWith = params.combinesWith;
  if (params.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(params.minimumRequirement);

  const response = await client.request<{
    discountAutomaticFreeShippingCreate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { freeShippingAutomaticDiscount: input });

  checkUserErrors(
    response.discountAutomaticFreeShippingCreate.userErrors,
    'Discount automatic free shipping create'
  );

  return response.discountAutomaticFreeShippingCreate.automaticDiscountNode;
}
