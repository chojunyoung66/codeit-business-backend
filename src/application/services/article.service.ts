import type {
  CreateArticleParams,
  UpdateArticleParams,
  ArticleService,
} from "../contracts/article.service.interface.js";
import { ArticleServiceError } from "../contracts/article.service.interface.js";
import type { ArticleRepo } from "../contracts/article.repo.interface.js";
import type { UserRepo } from "../contracts/user.repo.interface.js";
import type { ContentPolicy } from "../../domain/content-policy/content.policy.interface.js";

export const createArticleService = (
  articleRepo: ArticleRepo,
  userRepo: UserRepo,
  contentPolicy: ContentPolicy,
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
    const { userId, title, content } = params;

    // 사용자 존재여부 확인
    const user = await userRepo.findUserById(userId);
    if (!user) {
      throw new ArticleServiceError(
        "사용자를 찾을 수 없습니다",
        "USER_NOT_FOUND",
      );
    }

    // 금칙어 필터링
    if (
      contentPolicy.forbiddenWords.containsForbiddenWord(title) ||
      contentPolicy.forbiddenWords.containsForbiddenWord(content)
    ) {
      throw new ArticleServiceError(
        "부적절한 단어가 포함되어 있습니다",
        "FORBIDDEN_WORD_DETECTED",
      );
    }

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
