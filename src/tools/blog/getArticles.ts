import { ShopifyClient } from '../../shopify/client.ts';

interface ArticlesResponse {
  articles: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        handle: string;
        publishedAt: string | null;
      };
    }>;
  };
}

interface GetArticlesResult {
  articles: Array<{
    id: string;
    title: string;
    handle: string;
    publishedAt: string | null;
  }>;
}

const GET_ARTICLES_QUERY = `
  query GetArticles($first: Int!, $query: String) {
    articles(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          publishedAt
        }
      }
    }
  }
`;

export async function getArticles(
  client: ShopifyClient,
  params: {
    blogId?: string;
    first?: number;
    query?: string;
  }
): Promise<GetArticlesResult> {
  const first = params.first ?? 10;
  let queryStr = params.query ?? '';

  if (params.blogId) {
    const blogQuery = `blog_id:${params.blogId.split('/').pop()}`;
    queryStr = queryStr ? `${queryStr} AND ${blogQuery}` : blogQuery;
  }

  const response = await client.request<ArticlesResponse>(GET_ARTICLES_QUERY, {
    first,
    query: queryStr || null,
  });

  return {
    articles: response.articles.edges.map((edge) => edge.node),
  };
}
