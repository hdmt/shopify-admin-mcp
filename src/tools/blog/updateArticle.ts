import { ShopifyClient } from '../../shopify/client.ts';

interface ArticleUpdateResponse {
  articleUpdate: {
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

interface UpdateArticleResult {
  articleId: string;
  handle: string;
  title: string;
}

const ARTICLE_UPDATE_MUTATION = `
  mutation ArticleUpdate($id: ID!, $article: ArticleUpdateInput!) {
    articleUpdate(id: $id, article: $article) {
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

export async function updateArticle(
  client: ShopifyClient,
  params: {
    id: string;
    title?: string;
    contentHtml?: string;
    author?: string;
    tags?: string[];
    published?: boolean;
    publishedAt?: string;
  }
): Promise<UpdateArticleResult> {
  const { id, ...updates } = params;

  const article: Record<string, unknown> = {};

  if (updates.title) article.title = updates.title;
  if (updates.contentHtml) article.body = updates.contentHtml;
  if (updates.author) article.author = { name: updates.author };
  if (updates.tags) article.tags = updates.tags;
  if (updates.published !== undefined) article.isPublished = updates.published;
  if (updates.publishedAt) article.publishedAt = updates.publishedAt;

  const response = await client.request<ArticleUpdateResponse>(
    ARTICLE_UPDATE_MUTATION,
    { id, article }
  );

  if (response.articleUpdate.userErrors.length > 0) {
    throw new Error(
      `Article update failed: ${response.articleUpdate.userErrors
        .map((e) => e.message)
        .join(', ')}`
    );
  }

  if (!response.articleUpdate.article) {
    throw new Error('Article update failed: no article returned');
  }

  const updatedArticle = response.articleUpdate.article;

  return {
    articleId: updatedArticle.id,
    handle: updatedArticle.handle,
    title: updatedArticle.title,
  };
}
