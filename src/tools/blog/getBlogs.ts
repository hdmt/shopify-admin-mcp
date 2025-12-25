import { ShopifyClient } from '../../shopify/client.ts';

interface BlogsResponse {
  blogs: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
      };
    }>;
  };
}

interface GetBlogsResult {
  blogs: Array<{
    id: string;
    title: string;
    handle: string;
  }>;
}

const GET_BLOGS_QUERY = `
  query GetBlogs($first: Int!) {
    blogs(first: $first) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

export async function getBlogs(
  client: ShopifyClient,
  first: number = 10
): Promise<GetBlogsResult> {
  const response = await client.request<BlogsResponse>(GET_BLOGS_QUERY, {
    first,
  });

  return {
    blogs: response.blogs.edges.map((edge) => edge.node),
  };
}
