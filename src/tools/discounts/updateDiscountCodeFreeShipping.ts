import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildCustomerSelection,
  buildMinimumRequirement,
  checkUserErrors,
  type DiscountCustomerSelectionInput,
  type DiscountMinimumRequirementInput,
} from './helpers.ts';
import {
  buildShippingDestination,
  type MoneyInput,
  type ShippingDestinationInput,
} from './createDiscountCodeFreeShipping.ts';

const MUTATION = `
  mutation DiscountCodeFreeShippingUpdate($id: ID!, $freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
    discountCodeFreeShippingUpdate(id: $id, freeShippingCodeDiscount: $freeShippingCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeFreeShipping {
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

export interface UpdateDiscountCodeFreeShippingParams {
  id: string;
  title?: string;
  code?: string;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  appliesOncePerCustomer?: boolean;
  maximumShippingPrice?: MoneyInput;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerSelection?: DiscountCustomerSelectionInput;
  destination?: ShippingDestinationInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function updateDiscountCodeFreeShipping(
  client: ShopifyClient,
  params: UpdateDiscountCodeFreeShippingParams
) {
  const { id, ...rest } = params;
  const input: Record<string, unknown> = {};

  if (rest.title !== undefined) input.title = rest.title;
  if (rest.code !== undefined) input.code = rest.code;
  if (rest.startsAt !== undefined) input.startsAt = rest.startsAt;
  if (rest.endsAt !== undefined) input.endsAt = rest.endsAt;
  if (rest.usageLimit !== undefined) input.usageLimit = rest.usageLimit;
  if (rest.appliesOncePerCustomer !== undefined)
    input.appliesOncePerCustomer = rest.appliesOncePerCustomer;
  if (rest.maximumShippingPrice !== undefined)
    input.maximumShippingPrice = rest.maximumShippingPrice;
  if (rest.combinesWith) input.combinesWith = rest.combinesWith;
  if (rest.customerSelection)
    input.customerSelection = buildCustomerSelection(rest.customerSelection);
  if (rest.destination) input.destination = buildShippingDestination(rest.destination);
  if (rest.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(rest.minimumRequirement);

  const response = await client.request<{
    discountCodeFreeShippingUpdate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, freeShippingCodeDiscount: input });

  checkUserErrors(
    response.discountCodeFreeShippingUpdate.userErrors,
    'Discount code free shipping update'
  );

  return response.discountCodeFreeShippingUpdate.codeDiscountNode;
}
