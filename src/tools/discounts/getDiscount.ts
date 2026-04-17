import { ShopifyClient } from '../../shopify/client.ts';

const DISCOUNT_NODE_QUERY = `
  query DiscountNode($id: ID!) {
    discountNode(id: $id) {
      id
      discount {
        __typename
        ... on DiscountCodeBasic {
          title
          status
          startsAt
          endsAt
          summary
          usageLimit
          appliesOncePerCustomer
          asyncUsageCount
          customerGets {
            value {
              __typename
              ... on DiscountAmount {
                amount { amount currencyCode }
                appliesOnEachItem
              }
              ... on DiscountPercentage {
                percentage
              }
            }
            items {
              __typename
              ... on AllDiscountItems { allItems }
              ... on DiscountProducts {
                products(first: 20) { edges { node { id title } } }
              }
              ... on DiscountCollections {
                collections(first: 20) { edges { node { id title } } }
              }
            }
          }
          customerSelection {
            __typename
            ... on DiscountCustomerAll { allCustomers }
          }
          minimumRequirement {
            __typename
            ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
            ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
          }
          codes(first: 20) { edges { node { id code } } }
        }
        ... on DiscountCodeBxgy {
          title
          status
          startsAt
          endsAt
          summary
          usageLimit
          appliesOncePerCustomer
          asyncUsageCount
          usesPerOrderLimit
          codes(first: 20) { edges { node { id code } } }
        }
        ... on DiscountCodeFreeShipping {
          title
          status
          startsAt
          endsAt
          summary
          usageLimit
          appliesOncePerCustomer
          asyncUsageCount
          minimumRequirement {
            __typename
            ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
            ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
          }
          codes(first: 20) { edges { node { id code } } }
        }
        ... on DiscountAutomaticBasic {
          title
          status
          startsAt
          endsAt
          summary
          asyncUsageCount
          customerGets {
            value {
              __typename
              ... on DiscountAmount {
                amount { amount currencyCode }
                appliesOnEachItem
              }
              ... on DiscountPercentage { percentage }
            }
            items {
              __typename
              ... on AllDiscountItems { allItems }
              ... on DiscountProducts { products(first: 20) { edges { node { id title } } } }
              ... on DiscountCollections { collections(first: 20) { edges { node { id title } } } }
            }
          }
          minimumRequirement {
            __typename
            ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
            ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
          }
        }
        ... on DiscountAutomaticBxgy {
          title
          status
          startsAt
          endsAt
          summary
          asyncUsageCount
          usesPerOrderLimit
        }
        ... on DiscountAutomaticFreeShipping {
          title
          status
          startsAt
          endsAt
          summary
          asyncUsageCount
          minimumRequirement {
            __typename
            ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity }
            ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } }
          }
        }
      }
    }
  }
`;

export async function getDiscount(client: ShopifyClient, id: string) {
  const response = await client.request<{ discountNode: unknown }>(DISCOUNT_NODE_QUERY, { id });
  return response.discountNode;
}
