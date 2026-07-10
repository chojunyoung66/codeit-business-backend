import type {
  MemoService,
  CreateMemoService,
  CreateMemoParams,
  UpdateMemoParams,
} from "../contracts/memo.service.interface.js";
import { MemoServiceError } from "../contracts/memo.service.interface.js";
import type { MemoRepo } from "../contracts/memo.repo.interface.js";
import type { UserRepo } from "../contracts/user.repo.interface.js";

export const createMemoService = (
  memoRepo: MemoRepo,
  userRepo: UserRepo,
): MemoService => {
  const getMemos = async (userId: number) => {
    const memos = await memoRepo.findAll(userId);
    return memos;
  };

  const getMemoById = async (id: number) => {
    const memo = await memoRepo.findById(id);
    if (!memo) {
      throw new MemoServiceError("메모를 찾을 수 없습니다.", "MEMO_NOT_FOUND");
    }
    return memo;
  };

  const createMemo = async (params: CreateMemoParams) => {
    // 사용자 존재 여부 확인
    const user = await userRepo.findUserById(params.userId);
    if (!user) {
      throw new MemoServiceError(
        "사용자를 찾을 수 없습니다.",
        "USER_NOT_FOUND",
      );
    }

    const memo = await memoRepo.createMemo(params);
    return memo;
  };

  const updateMemo = async (params: UpdateMemoParams) => {
    // 메모 필터링: undefined 값은 제외
    const updateData: { title?: string; content?: string } = {};
    if (params.title !== undefined) {
      updateData.title = params.title;
    }
    if (params.content !== undefined) {
      updateData.content = params.content;
    }

    try {
      const memo = await memoRepo.updateMemo(params.id, updateData);
      return memo;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No record was found")
      ) {
        throw new MemoServiceError("메모를 찾을 수 없습니다.", "MEMO_NOT_FOUND");
      }
      throw error;
    }
  };

  const deleteMemo = async (id: number) => {
    try {
      await memoRepo.deleteMemo(id);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No record was found")
      ) {
        throw new MemoServiceError("메모를 찾을 수 없습니다.", "MEMO_NOT_FOUND");
      }
      throw error;
    }
  };

  return {
    getMemos,
    getMemoById,
    createMemo,
    updateMemo,
    deleteMemo,
  };
};
