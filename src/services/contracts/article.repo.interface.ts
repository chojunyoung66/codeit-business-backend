import type { Article } from "../../generated/prisma/client.js";

export interface ArticleRepo {
  findAll(): Promise<Article[]>;
  findById(id: number): Promise<Article | null>;
  createArticle(data: { userId: number; title: string; content: string }): Promise<Article>;
}
