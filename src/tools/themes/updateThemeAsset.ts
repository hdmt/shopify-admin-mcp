import type { ShopifyClient } from '../../shopify/client.ts';
import type { ThemeAsset } from './getThemeAsset.ts';

interface AssetResponse {
  asset: ThemeAsset;
}

export async function updateThemeAsset(
  client: ShopifyClient,
  themeId: number,
  key: string,
  value: string
): Promise<ThemeAsset> {
  const response = await client.restPut<AssetResponse>(
    `/themes/${themeId}/assets.json`,
    {
      asset: {
        key,
        value,
      },
    }
  );
  return response.asset;
}
