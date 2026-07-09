import { prismaClient } from "../../db/prisma.js";
import type { ArticleRepo } from "../../application/contracts/article.repo.interface.js";

export const createArticleRepo = (): ArticleRepo => {
  const findAll = async () => {
    // 모든 게시글을 최신순으로 조회
    return prismaClient.article.findMany({ orderBy: { createdAt: "desc" } });
  };

  const findById = async (id: number) => {
    // 특정 게시글 조회
    return prismaClient.article.findUnique({ where: { id } });
  };

  const createArticle = async (data: {
    userId: number;
    title: string;
    content: string;
  }) => {
    // 새 게시글 생성
    return prismaClient.article.create({ data });
  };

  const updateArticle = async (
    id: number,
    data: { title?: string; content?: string },
  ) => {
    // 게시글 수정
    return prismaClient.article.update({ where: { id }, data });
  };

  const deleteArticle = async (id: number) => {
    // 게시글 삭제
    return prismaClient.article.delete({ where: { id } });
  };

  return { findAll, findById, createArticle, updateArticle, deleteArticle };
};
