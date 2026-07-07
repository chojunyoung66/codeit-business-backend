import { PrismaClient } from "../generated/prisma/client.js";

export const createArticleRepo = (prismaClient: PrismaClient) => {
  const findAll = async () => {
    return prismaClient.article.findMany({ orderBy: { createdAt: "desc" } });
  };

  const findById = async (id: number) => {
    return prismaClient.article.findUnique({ where: { id } });
  };

  const createArticle = async (data: { userId: number; title: string; content: string }) => {
    return prismaClient.article.create({ data });
  };

  return { findAll, findById, createArticle };
};
