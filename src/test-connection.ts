import { ShopifyClient } from './shopify/client.ts';

async function main() {
  console.log('Testing Shopify API connection...\n');

  const domain = process.env.SHOPIFY_SHOP_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;

  console.log('Environment check:');
  console.log(`  SHOPIFY_SHOP_DOMAIN: ${domain ? '✓ set' : '✗ not set'}`);
  console.log(`  SHOPIFY_ACCESS_TOKEN: ${token ? '✓ set' : '✗ not set'}`);
  console.log('');

  if (!domain || !token) {
    console.error('Error: Missing required environment variables');
    process.exit(1);
  }

  try {
    const client = new ShopifyClient();
    const result = await client.testConnection();

    console.log('Connection successful!\n');
    console.log('Shop Info:');
    console.log(`  Name: ${result.shop.name}`);
    console.log(`  Email: ${result.shop.email}`);
    console.log(`  Domain: ${result.shop.myshopifyDomain}`);
    console.log(`  Plan: ${result.shop.plan.displayName}`);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

main();
