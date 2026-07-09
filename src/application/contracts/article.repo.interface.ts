import type { Article } from "../../generated/prisma/client.js";

export interface ArticleRepo {
  findAll(): Promise<Article[]>;
  findById(id: number): Promise<Article | null>;
  createArticle(data: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Article>;
  updateArticle(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Article>;
  deleteArticle(id: number): Promise<Article>;
}
