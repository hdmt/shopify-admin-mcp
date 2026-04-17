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
  mutation DiscountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
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

export interface UpdateDiscountCodeBasicParams {
  id: string;
  title?: string;
  code?: string;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
  appliesOncePerCustomer?: boolean;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerGets?: {
    value: DiscountValueInput;
    items: DiscountItemsInput;
  };
  customerSelection?: DiscountCustomerSelectionInput;
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function updateDiscountCodeBasic(
  client: ShopifyClient,
  params: UpdateDiscountCodeBasicParams
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
  if (rest.combinesWith) input.combinesWith = rest.combinesWith;
  if (rest.customerGets) {
    input.customerGets = {
      value: buildDiscountValue(rest.customerGets.value),
      items: buildDiscountItems(rest.customerGets.items),
    };
  }
  if (rest.customerSelection) input.customerSelection = buildCustomerSelection(rest.customerSelection);
  if (rest.minimumRequirement) input.minimumRequirement = buildMinimumRequirement(rest.minimumRequirement);

  const response = await client.request<{
    discountCodeBasicUpdate: {
      codeDiscountNode: { id: string; codeDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { id, basicCodeDiscount: input });

  checkUserErrors(response.discountCodeBasicUpdate.userErrors, 'Discount code basic update');

  return response.discountCodeBasicUpdate.codeDiscountNode;
}
