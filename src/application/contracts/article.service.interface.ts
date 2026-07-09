import type { ArticleRepo } from "./article.repo.interface.js";

export type CreateArticleParams = {
  userId: number;
  title: string;
  content: string;
};

export type UpdateArticleParams = {
  id: number;
  title?: string;
  content?: string;
};

export type ArticleErrorCode = "ARTICLE_NOT_FOUND" | "DATABASE_ERROR";

export class ArticleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: ArticleErrorCode,
  ) {
    super(message);
    this.name = "ArticleServiceError";
  }
}

export interface ArticleService {
  getArticles(): Promise<any[]>;
  getArticleById(id: number): Promise<any>;
  createArticle(params: CreateArticleParams): Promise<any>;
  updateArticle(params: UpdateArticleParams): Promise<any>;
  deleteArticle(id: number): Promise<void>;
}

export type CreateArticleService = (articleRepo: ArticleRepo) => ArticleService;
