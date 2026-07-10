import { Router, Request, Response } from "express";
import { createMemoRepo } from "../../outbound/repos/memo.repo.js";
import { createUserRepo } from "../../outbound/repos/user.repo.js";
import { createMemoService } from "../../application/services/memo.service.js";
import { createMemoSchema, updateMemoSchema } from "../schemas/memo.schema.js";
import { MemoServiceError } from "../../application/contracts/memo.service.interface.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

const memoRepo = createMemoRepo();
const userRepo = createUserRepo();
const { getMemos, getMemoById, createMemo, updateMemo, deleteMemo } =
  createMemoService(memoRepo, userRepo);

router.get("/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  if (typeof userId !== "string") {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }
  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedUserId)) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }

  try {
    // 사용자의 모든 메모 조회
    const memos = await getMemos(parsedUserId);
    return res.json({ memos });
  } catch (error) {
    throw error;
  }
});

router.get("/:id/detail", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }

  try {
    // 메모 상세 조회
    const memo = await getMemoById(parsedId);
    return res.json({ memo });
  } catch (error) {
    if (error instanceof MemoServiceError) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const parsedBody = createMemoSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    // 새로운 메모 생성
    const memo = await createMemo(parsedBody.data);
    return res.status(201).json({ memo });
  } catch (error) {
    if (error instanceof MemoServiceError) {
      return res.status(400).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.put("/:id", authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }

  const parsedBody = updateMemoSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    // 메모 수정
    const memo = await updateMemo({ id: parsedId, ...parsedBody.data });
    return res.json({ memo });
  } catch (error) {
    if (error instanceof MemoServiceError) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  const id = req.params.id;
  if (typeof id !== "string") {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
    });
  }

  try {
    // 메모 삭제
    await deleteMemo(parsedId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof MemoServiceError) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

export default router;
