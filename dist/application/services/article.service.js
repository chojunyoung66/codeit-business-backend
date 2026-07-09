import { ArticleServiceError } from "../contracts/article.service.interface.js";
export const createArticleService = (articleRepo) => {
  const getArticles = async () => {
    // 모든 게시글 조회
    return articleRepo.findAll();
  };
  const getArticleById = async (id) => {
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
  const createArticle = async (params) => {
    // 새로운 게시글 생성
    return articleRepo.createArticle(params);
  };
  const updateArticle = async (params) => {
    // 게시글 존재 확인
    const article = await articleRepo.findById(params.id);
    if (!article) {
      throw new ArticleServiceError(
        "게시글을 찾을 수 없습니다",
        "ARTICLE_NOT_FOUND",
      );
    }
    // 게시글 수정
    const updateData = {};
    if (params.title !== undefined) {
      updateData.title = params.title;
    }
    if (params.content !== undefined) {
      updateData.content = params.content;
    }
    return articleRepo.updateArticle(params.id, updateData);
  };
  const deleteArticle = async (id) => {
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
