import { ShopifyClient } from '../../shopify/client.ts';

interface OrdersResponse {
  orders: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: Array<{
      node: {
        id: string;
        createdAt: string;
        lineItems: {
          edges: Array<{
            node: {
              product: {
                id: string;
                title: string;
              } | null;
              quantity: number;
            };
          }>;
        };
      };
    }>;
  };
}

interface RankingResult {
  period: { year: number; month: number };
  products: Array<{
    rank: number;
    productId: string;
    title: string;
    totalQuantity: number;
  }>;
}

const GET_ORDERS_QUERY = `
  query GetOrders($query: String!, $first: Int!, $after: String) {
    orders(first: $first, query: $query, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          createdAt
          lineItems(first: 50) {
            edges {
              node {
                product {
                  id
                  title
                }
                quantity
              }
            }
          }
        }
      }
    }
  }
`;

export async function getMonthlyRanking(
  client: ShopifyClient,
  year: number,
  month: number,
  limit: number = 15
): Promise<RankingResult> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];

  const query = `created_at:>=${startStr} AND created_at:<${endStr} AND financial_status:paid`;

  const productSales = new Map<string, { title: string; quantity: number }>();
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await client.request<OrdersResponse>(GET_ORDERS_QUERY, {
      query,
      first: 50,
      after: cursor,
    });

    for (const orderEdge of response.orders.edges) {
      for (const itemEdge of orderEdge.node.lineItems.edges) {
        const product = itemEdge.node.product;
        if (!product) continue;

        const existing = productSales.get(product.id);
        if (existing) {
          existing.quantity += itemEdge.node.quantity;
        } else {
          productSales.set(product.id, {
            title: product.title,
            quantity: itemEdge.node.quantity,
          });
        }
      }
    }

    hasNextPage = response.orders.pageInfo.hasNextPage;
    cursor = response.orders.pageInfo.endCursor;
  }

  const sorted = Array.from(productSales.entries())
    .map(([productId, data]) => ({
      productId,
      title: data.title,
      totalQuantity: data.quantity,
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);

  return {
    period: { year, month },
    products: sorted.map((item, index) => ({
      rank: index + 1,
      ...item,
    })),
  };
}
