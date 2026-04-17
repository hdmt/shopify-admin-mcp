import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildCustomerSelection,
  buildMinimumRequirement,
  checkUserErrors,
  type DiscountCustomerSelectionInput,
  type DiscountMinimumRequirementInput,
} from './helpers.ts';

export type ShippingDestinationInput =
  | { type: 'all' }
  | { type: 'countries'; countryCodes: string[]; includeRestOfWorld?: boolean };

export function buildShippingDestination(
  dest: ShippingDestinationInput
): Record<string, unknown> {
  if (dest.type === 'all') return { all: true };
  return {
    countries: {
      add: dest.countryCodes,
      includeRestOfWorld: dest.includeRestOfWorld ?? false,
    },
  };
}

const MUTATION = `
  mutation DiscountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
    discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeFreeShipping {
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

export interface MoneyInput {
  amount: number;
  currencyCode: string;
}

export interface CreateDiscountCodeFreeShippingParams {
  title: string;
  code: string;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  appliesOncePerCustomer?: boolean;
  maximumShippingPrice?: MoneyInput;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerSelection: DiscountCustomerSelectionInput;
  destination: ShippingDestinationInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function createDiscountCodeFreeShipping(
  client: ShopifyClient,
  params: CreateDiscountCodeFreeShippingParams
) {
  const input: Record<string, unknown> = {
    title: params.title,
    code: params.code,
    startsAt: params.startsAt,
    customerSelection: buildCustomerSelection(params.customerSelection),
    destination: buildShippingDestination(params.destination),
  };

  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.usageLimit !== undefined) input.usageLimit = params.usageLimit;
  if (params.appliesOncePerCustomer !== undefined)
    input.appliesOncePerCustomer = params.appliesOncePerCustomer;
  if (params.maximumShippingPrice !== undefined)
    input.maximumShippingPrice = params.maximumShippingPrice;
  if (params.combinesWith) input.combinesWith = params.combinesWith;
  if (params.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(params.minimumRequirement);

  const response = await client.request<{
    discountCodeFreeShippingCreate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { freeShippingCodeDiscount: input });

  checkUserErrors(
    response.discountCodeFreeShippingCreate.userErrors,
    'Discount code free shipping create'
  );

  return response.discountCodeFreeShippingCreate.codeDiscountNode;
}
