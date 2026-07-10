import type { MemoRepo } from "./memo.repo.interface.js";
import type { UserRepo } from "./user.repo.interface.js";

export type CreateMemoParams = {
  userId: number;
  title: string;
  content: string;
};

export type UpdateMemoParams = {
  id: number;
  title?: string;
  content?: string;
};

export type MemoErrorCode =
  "MEMO_NOT_FOUND" | "DATABASE_ERROR" | "USER_NOT_FOUND";

export class MemoServiceError extends Error {
  constructor(
    message: string,
    public readonly code: MemoErrorCode,
  ) {
    super(message);
    this.name = "MemoServiceError";
  }
}

export interface MemoService {
  getMemos(userId: number): Promise<any[]>;
  getMemoById(id: number): Promise<any>;
  createMemo(params: CreateMemoParams): Promise<any>;
  updateMemo(params: UpdateMemoParams): Promise<any>;
  deleteMemo(id: number): Promise<void>;
}

export type CreateMemoService = (
  memoRepo: MemoRepo,
  userRepo: UserRepo,
) => MemoService;
