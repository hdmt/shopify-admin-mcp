export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface ShopInfo {
  shop: {
    name: string;
    email: string;
    myshopifyDomain: string;
    plan: {
      displayName: string;
    };
  };
}
