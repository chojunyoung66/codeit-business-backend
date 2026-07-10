import type { Memo } from "../../generated/prisma/client.js";

export interface MemoRepo {
  findAll(userId: number): Promise<Memo[]>;
  findById(id: number): Promise<Memo | null>;
  createMemo(data: {
    userId: number;
    title: string;
    content: string;
  }): Promise<Memo>;
  updateMemo(
    id: number,
    data: { title?: string; content?: string },
  ): Promise<Memo>;
  deleteMemo(id: number): Promise<Memo>;
}
