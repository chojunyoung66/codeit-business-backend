import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { createMemoService } from "./memo.service.js";
import type { MemoRepo } from "../contracts/memo.repo.interface.js";
import type { UserRepo } from "../contracts/user.repo.interface.js";

const createMockMemoRepo = (): MemoRepo => ({
  findAll: () => Promise.resolve([]),
  findById: () => Promise.resolve(null),
  createMemo: () => Promise.resolve({} as any),
  updateMemo: jest.fn<any>() as any,
  deleteMemo: () => Promise.resolve({} as any),
});

const createMockUserRepo = (): UserRepo => ({
  findUserByEmail: () => Promise.resolve(null),
  createUser: () => Promise.resolve({} as any),
  findUserById: jest.fn() as any,
  updateUser: () => Promise.resolve({} as any),
  deleteUser: () => Promise.resolve({} as any),
});

describe("MemoService - updateMemo", () => {
  let memoRepo: MemoRepo;
  let userRepo: UserRepo;

  beforeEach(() => {
    memoRepo = createMockMemoRepo();
    userRepo = createMockUserRepo();
  });

  it("should update memo with new title and content", async () => {
    const memoId = 1;
    const updatedMemo = {
      id: memoId,
      userId: 1,
      title: "Updated Title",
      content: "Updated Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(memoRepo.updateMemo).mockResolvedValue(updatedMemo);

    const { updateMemo } = createMemoService(memoRepo, userRepo);
    const result = await updateMemo({
      id: memoId,
      title: "Updated Title",
      content: "Updated Content",
    });

    expect(result).toEqual(updatedMemo);
    expect(memoRepo.updateMemo).toHaveBeenCalledWith(memoId, {
      title: "Updated Title",
      content: "Updated Content",
    });
  });

  it("should update memo with only title", async () => {
    const memoId = 1;
    const updatedMemo = {
      id: memoId,
      userId: 1,
      title: "New Title",
      content: "Original Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(memoRepo.updateMemo).mockResolvedValue(updatedMemo);

    const { updateMemo } = createMemoService(memoRepo, userRepo);
    const result = await updateMemo({
      id: memoId,
      title: "New Title",
    });

    expect(result).toEqual(updatedMemo);
    expect(memoRepo.updateMemo).toHaveBeenCalledWith(memoId, {
      title: "New Title",
    });
  });

  it("should update memo with only content", async () => {
    const memoId = 1;
    const updatedMemo = {
      id: memoId,
      userId: 1,
      title: "Original Title",
      content: "New Content",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(memoRepo.updateMemo).mockResolvedValue(updatedMemo);

    const { updateMemo } = createMemoService(memoRepo, userRepo);
    const result = await updateMemo({
      id: memoId,
      content: "New Content",
    });

    expect(result).toEqual(updatedMemo);
    expect(memoRepo.updateMemo).toHaveBeenCalledWith(memoId, {
      content: "New Content",
    });
  });
});
