import { ShopifyClient } from '../../shopify/client.ts';

interface DiscountNode {
  id: string;
  discount: {
    __typename: string;
    title?: string;
    status?: string;
    startsAt?: string;
    endsAt?: string;
    codes?: {
      edges: Array<{ node: { code: string } }>;
    };
    summary?: string;
    usageLimit?: number | null;
    asyncUsageCount?: number;
  };
}

interface DiscountNodesResponse {
  discountNodes: {
    edges: Array<{ node: DiscountNode }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
}

const DISCOUNT_NODES_QUERY = `
  query DiscountNodes($first: Int!, $after: String, $query: String) {
    discountNodes(first: $first, after: $after, query: $query) {
      edges {
        node {
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
              asyncUsageCount
              codes(first: 5) {
                edges { node { code } }
              }
            }
            ... on DiscountCodeBxgy {
              title
              status
              startsAt
              endsAt
              summary
              usageLimit
              asyncUsageCount
              codes(first: 5) {
                edges { node { code } }
              }
            }
            ... on DiscountCodeFreeShipping {
              title
              status
              startsAt
              endsAt
              summary
              usageLimit
              asyncUsageCount
              codes(first: 5) {
                edges { node { code } }
              }
            }
            ... on DiscountAutomaticBasic {
              title
              status
              startsAt
              endsAt
              summary
              asyncUsageCount
            }
            ... on DiscountAutomaticBxgy {
              status
              startsAt
              endsAt
              summary
              asyncUsageCount
            }
            ... on DiscountAutomaticFreeShipping {
              title
              status
              startsAt
              endsAt
              summary
              asyncUsageCount
            }
            ... on DiscountAutomaticApp {
              title
              status
              startsAt
              endsAt
              asyncUsageCount
            }
            ... on DiscountCodeApp {
              title
              status
              startsAt
              endsAt
              asyncUsageCount
              codes(first: 5) {
                edges { node { code } }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export async function getDiscounts(
  client: ShopifyClient,
  params: { first?: number; after?: string; query?: string }
) {
  const response = await client.request<DiscountNodesResponse>(DISCOUNT_NODES_QUERY, {
    first: params.first ?? 20,
    after: params.after,
    query: params.query,
  });

  return {
    discounts: response.discountNodes.edges.map((edge) => {
      const { id, discount } = edge.node;
      const codes = discount.codes?.edges.map((c) => c.node.code);
      return {
        id,
        type: discount.__typename,
        title: discount.title,
        status: discount.status,
        startsAt: discount.startsAt,
        endsAt: discount.endsAt,
        summary: discount.summary,
        usageLimit: discount.usageLimit,
        asyncUsageCount: discount.asyncUsageCount,
        codes,
      };
    }),
    pageInfo: response.discountNodes.pageInfo,
  };
}
