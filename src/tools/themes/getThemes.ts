import type { ShopifyClient } from '../../shopify/client.ts';

export interface Theme {
  id: number;
  name: string;
  role: 'main' | 'unpublished' | 'demo';
  theme_store_id: number | null;
  previewable: boolean;
  processing: boolean;
  admin_graphql_api_id: string;
  created_at: string;
  updated_at: string;
}

interface ThemesResponse {
  themes: Theme[];
}

export async function getThemes(client: ShopifyClient): Promise<Theme[]> {
  const response = await client.restGet<ThemesResponse>('/themes.json');
  return response.themes;
}
