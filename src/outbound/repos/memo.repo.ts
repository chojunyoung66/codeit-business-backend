import type { MemoRepo } from "../../application/contracts/memo.repo.interface.js";
import { prismaClient } from "../../db/prisma.js";

export const createMemoRepo = (): MemoRepo => {
  const findAll = async (userId: number) => {
    const memos = await prismaClient.memo.findMany({
      where: { userId },
    });
    return memos;
  };

  const findById = async (id: number) => {
    const memo = await prismaClient.memo.findUnique({
      where: { id },
    });
    return memo;
  };

  const createMemo = async (data: {
    userId: number;
    title: string;
    content: string;
  }) => {
    const memo = await prismaClient.memo.create({
      data,
    });
    return memo;
  };

  const updateMemo = async (
    id: number,
    data: { title?: string; content?: string },
  ) => {
    const memo = await prismaClient.memo.update({
      where: { id },
      data,
    });
    return memo;
  };

  const deleteMemo = async (id: number) => {
    const memo = await prismaClient.memo.delete({
      where: { id },
    });
    return memo;
  };

  return {
    findAll,
    findById,
    createMemo,
    updateMemo,
    deleteMemo,
  };
};
