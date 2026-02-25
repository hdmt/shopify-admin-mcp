import { ShopifyClient } from '../../shopify/client.ts';

interface MenuUpdateResponse {
  menuUpdate: {
    menu: {
      id: string;
      title: string;
      handle: string;
      items: Array<{
        id: string;
        title: string;
        type: string;
        url: string;
        resourceId: string | null;
      }>;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

interface MenuItemInput {
  title: string;
  type?: string;
  url?: string;
  resourceId?: string;
  items?: MenuItemInput[];
}

interface UpdateMenuResult {
  menuId: string;
  title: string;
  handle: string;
  items: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    resourceId: string | null;
  }>;
}

const MENU_UPDATE_MUTATION = `
  mutation MenuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
    menuUpdate(id: $id, title: $title, items: $items) {
      menu {
        id
        title
        handle
        items {
          id
          title
          type
          url
          resourceId
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function updateMenu(
  client: ShopifyClient,
  params: {
    id: string;
    title: string;
    items: MenuItemInput[];
  }
): Promise<UpdateMenuResult> {
  const response = await client.request<MenuUpdateResponse>(MENU_UPDATE_MUTATION, {
    id: params.id,
    title: params.title,
    items: params.items,
  });

  if (response.menuUpdate.userErrors.length > 0) {
    throw new Error(`Menu update failed: ${JSON.stringify(response.menuUpdate.userErrors)}`);
  }

  if (!response.menuUpdate.menu) {
    throw new Error('Menu not found after update');
  }

  const menu = response.menuUpdate.menu;
  return {
    menuId: menu.id,
    title: menu.title,
    handle: menu.handle,
    items: menu.items,
  };
}
