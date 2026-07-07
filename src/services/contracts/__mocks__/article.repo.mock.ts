import type { Article } from "../../../generated/prisma/client.js";
import type { ArticleRepo } from "../article.repo.interface.js";

export const createArticleRepoMock = (initial?: Article[]): ArticleRepo => {
  const articles: Article[] = initial ? [...initial] : [];

  return {
    findAll: async () => articles.slice().sort((a,b)=> (b.createdAt as any).getTime() - (a.createdAt as any).getTime()),
    findById: async (id: number) => articles.find((m) => (m.id as number) === id) ?? null,
    createArticle: async (data) => {
      const id = articles.length ? (articles[articles.length - 1].id as number) + 1 : 1;
      const newArticle = {
        id,
        userId: data.userId,
        title: data.title,
        content: data.content,
        createdAt: new Date(),
      } as unknown as Article;
      articles.push(newArticle);
      return newArticle;
    },
  };
};
