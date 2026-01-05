import type { ShopifyClient } from '../../shopify/client.ts';

export interface ThemeAsset {
  key: string;
  value?: string;
  public_url?: string;
  content_type?: string;
  size?: number;
  checksum?: string;
  theme_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface AssetResponse {
  asset: ThemeAsset;
}

export async function getThemeAsset(
  client: ShopifyClient,
  themeId: number,
  key: string
): Promise<ThemeAsset> {
  const response = await client.restGet<AssetResponse>(
    `/themes/${themeId}/assets.json`,
    { 'asset[key]': key }
  );
  return response.asset;
}
