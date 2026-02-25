import { ShopifyClient } from '../../shopify/client.ts';

interface MenusResponse {
  menus: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        items: Array<{
          id: string;
          title: string;
          type: string;
          url: string;
          resourceId: string | null;
          items: Array<{
            id: string;
            title: string;
            type: string;
            url: string;
            resourceId: string | null;
          }>;
        }>;
      };
    }>;
  };
}

interface GetMenusResult {
  menus: Array<{
    id: string;
    title: string;
    handle: string;
    items: Array<{
      id: string;
      title: string;
      type: string;
      url: string;
      resourceId: string | null;
      items: Array<{
        id: string;
        title: string;
        type: string;
        url: string;
        resourceId: string | null;
      }>;
    }>;
  }>;
}

const GET_MENUS_QUERY = `
  query GetMenus($first: Int!) {
    menus(first: $first) {
      edges {
        node {
          id
          title
          handle
          items {
            id
            title
            type
            url
            resourceId
            items {
              id
              title
              type
              url
              resourceId
            }
          }
        }
      }
    }
  }
`;

export async function getMenus(
  client: ShopifyClient,
  first: number = 10
): Promise<GetMenusResult> {
  const response = await client.request<MenusResponse>(GET_MENUS_QUERY, {
    first,
  });

  return {
    menus: response.menus.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      items: edge.node.items,
    })),
  };
}
