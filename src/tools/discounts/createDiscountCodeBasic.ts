import { ShopifyClient } from '../../shopify/client.ts';
import {
  buildCustomerSelection,
  buildDiscountItems,
  buildDiscountValue,
  buildMinimumRequirement,
  checkUserErrors,
  type DiscountCustomerSelectionInput,
  type DiscountItemsInput,
  type DiscountMinimumRequirementInput,
  type DiscountValueInput,
} from './helpers.ts';

const MUTATION = `
  mutation DiscountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
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

export interface CreateDiscountCodeBasicParams {
  title: string;
  code: string;
  startsAt: string;
  endsAt?: string;
  usageLimit?: number;
  appliesOncePerCustomer?: boolean;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerGets: {
    value: DiscountValueInput;
    items: DiscountItemsInput;
  };
  customerSelection: DiscountCustomerSelectionInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function createDiscountCodeBasic(
  client: ShopifyClient,
  params: CreateDiscountCodeBasicParams
) {
  const input: Record<string, unknown> = {
    title: params.title,
    code: params.code,
    startsAt: params.startsAt,
    customerGets: {
      value: buildDiscountValue(params.customerGets.value),
      items: buildDiscountItems(params.customerGets.items),
    },
    customerSelection: buildCustomerSelection(params.customerSelection),
  };

  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.usageLimit !== undefined) input.usageLimit = params.usageLimit;
  if (params.appliesOncePerCustomer !== undefined)
    input.appliesOncePerCustomer = params.appliesOncePerCustomer;
  if (params.combinesWith) input.combinesWith = params.combinesWith;
  if (params.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(params.minimumRequirement);

  const response = await client.request<{
    discountCodeBasicCreate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { basicCodeDiscount: input });

  checkUserErrors(response.discountCodeBasicCreate.userErrors, 'Discount code basic create');

  return response.discountCodeBasicCreate.codeDiscountNode;
}
