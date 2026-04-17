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
  mutation DiscountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
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

export interface CreateDiscountAutomaticBasicParams {
  title: string;
  startsAt: string;
  endsAt?: string;
  combinesWith?: {
    productDiscounts?: boolean;
    orderDiscounts?: boolean;
    shippingDiscounts?: boolean;
  };
  customerGets: {
    value: DiscountValueInput;
    items: DiscountItemsInput;
  };
  minimumRequirement?: DiscountMinimumRequirementInput;
}

export async function createDiscountAutomaticBasic(
  client: ShopifyClient,
  params: CreateDiscountAutomaticBasicParams
) {
  const input: Record<string, unknown> = {
    title: params.title,
    startsAt: params.startsAt,
    customerGets: {
      value: buildDiscountValue(params.customerGets.value),
      items: buildDiscountItems(params.customerGets.items),
    },
  };

  if (params.endsAt) input.endsAt = params.endsAt;
  if (params.combinesWith) input.combinesWith = params.combinesWith;
  if (params.minimumRequirement)
    input.minimumRequirement = buildMinimumRequirement(params.minimumRequirement);

  const response = await client.request<{
    discountAutomaticBasicCreate: {
      automaticDiscountNode: { id: string; automaticDiscount: unknown } | null;
      userErrors: Array<{ field?: string[] | null; message: string; code?: string }>;
    };
  }>(MUTATION, { automaticBasicDiscount: input });

  checkUserErrors(
    response.discountAutomaticBasicCreate.userErrors,
    'Discount automatic basic create'
  );

  return response.discountAutomaticBasicCreate.automaticDiscountNode;
}
