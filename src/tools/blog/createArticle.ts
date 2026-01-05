import { ShopifyClient } from '../../shopify/client.ts';

interface ArticleCreateResponse {
  articleCreate: {
    article: {
      id: string;
      handle: string;
      title: string;
    } | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

interface CreateArticleResult {
  articleId: string;
  handle: string;
  adminUrl: string;
}

const ARTICLE_CREATE_MUTATION = `
  mutation ArticleCreate($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article {
        id
        handle
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function createArticle(
  client: ShopifyClient,
  params: {
    blogId: string;
    title: string;
    contentHtml: string;
    handle?: string;
    author?: string;
    tags?: string[];
    published?: boolean;
    publishedAt?: string;
  }
): Promise<CreateArticleResult> {
  const article: Record<string, unknown> = {
    blogId: params.blogId,
    title: params.title,
    body: params.contentHtml,
  };

  if (params.handle) article.handle = params.handle;
  if (params.author) article.author = { name: params.author };
  if (params.tags) article.tags = params.tags;
  if (params.published !== undefined) article.isPublished = params.published;
  if (params.publishedAt) article.publishedAt = params.publishedAt;

  const response = await client.request<ArticleCreateResponse>(
    ARTICLE_CREATE_MUTATION,
    { article }
  );

  if (response.articleCreate.userErrors.length > 0) {
    throw new Error(
      `Article create failed: ${response.articleCreate.userErrors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  if (!response.articleCreate.article) {
    throw new Error('Article create failed: no article returned');
  }

  const createdArticle = response.articleCreate.article;
  const numericId = createdArticle.id.split('/').pop();

  return {
    articleId: createdArticle.id,
    handle: createdArticle.handle,
    adminUrl: `https://admin.shopify.com/store/bonz-kousui/articles/${numericId}`,
  };
}
