import { prismaClient } from "../../db/prisma.js";
export const createArticleRepo = () => {
    const findAll = async () => {
        // 모든 게시글을 최신순으로 조회
        return prismaClient.article.findMany({ orderBy: { createdAt: "desc" } });
    };
    const findById = async (id) => {
        // 특정 게시글 조회
        return prismaClient.article.findUnique({ where: { id } });
    };
    const createArticle = async (data) => {
        // 새 게시글 생성
        return prismaClient.article.create({ data });
    };
    const updateArticle = async (id, data) => {
        // 게시글 수정
        return prismaClient.article.update({ where: { id }, data });
    };
    const deleteArticle = async (id) => {
        // 게시글 삭제
        return prismaClient.article.delete({ where: { id } });
    };
    return { findAll, findById, createArticle, updateArticle, deleteArticle };
};
