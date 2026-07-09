import type {
  CreateArticleParams,
  UpdateArticleParams,
  ArticleService,
} from "../contracts/article.service.interface.js";
import { ArticleServiceError } from "../contracts/article.service.interface.js";
import type { ArticleRepo } from "../contracts/article.repo.interface.js";

export const createArticleService = (
  articleRepo: ArticleRepo,
): ArticleService => {
  const getArticles = async () => {
    // 모든 게시글 조회
    return articleRepo.findAll();
  };

  const getArticleById = async (id: number) => {
    // 게시글 상세 조회
    const article = await articleRepo.findById(id);
    if (!article) {
      throw new ArticleServiceError(
        "게시글을 찾을 수 없습니다",
        "ARTICLE_NOT_FOUND",
      );
    }
    return article;
  };

  const createArticle = async (params: CreateArticleParams) => {
    // 새로운 게시글 생성
    return articleRepo.createArticle(params);
  };

  const updateArticle = async (params: UpdateArticleParams) => {
    // 게시글 존재 확인
    const article = await articleRepo.findById(params.id);
    if (!article) {
      throw new ArticleServiceError(
        "게시글을 찾을 수 없습니다",
        "ARTICLE_NOT_FOUND",
      );
    }
    // 게시글 수정
    const updateData: { title?: string; content?: string } = {};
    if (params.title !== undefined) {
      updateData.title = params.title;
    }
    if (params.content !== undefined) {
      updateData.content = params.content;
    }
    return articleRepo.updateArticle(params.id, updateData);
  };

  const deleteArticle = async (id: number) => {
    // 게시글 존재 확인
    const article = await articleRepo.findById(id);
    if (!article) {
      throw new ArticleServiceError(
        "게시글을 찾을 수 없습니다",
        "ARTICLE_NOT_FOUND",
      );
    }
    // 게시글 삭제
    await articleRepo.deleteArticle(id);
  };

  return {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
