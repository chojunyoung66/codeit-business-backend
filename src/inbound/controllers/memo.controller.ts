import { Router, Request, Response } from "express";
import { createArticleRepo } from "../../outbound/repos/article.repo.js";
import { createUserRepo } from "../../outbound/repos/user.repo.js";
import { createArticleService } from "../../application/services/article.service.js";
import { createForbiddenWordsUtil } from "../../utils/forbidden-words.util.js";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../schemas/article.schema.js";
import { ArticleServiceError } from "../../application/contracts/article.service.interface.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = Router();

const articleRepo = createArticleRepo();
const userRepo = createUserRepo();
const forbiddenWordsUtil = createForbiddenWordsUtil();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = createArticleService(articleRepo, userRepo, forbiddenWordsUtil);

router.get("/", async (_req: Request, res: Response) => {
  try {
    // 모든 게시글 조회
    const articles = await getArticles();
    return res.json({ articles });
  } catch (error) {
    throw error;
  }
});

router.get("/:id", async (req: Request, res: Response) => {
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
    // 게시글 상세 조회
    const article = await getArticleById(parsedId);
    return res.json({ article });
  } catch (error) {
    if (error instanceof ArticleServiceError) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const parsedBody = createArticleSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    // 새로운 게시글 생성
    const article = await createArticle(parsedBody.data);
    return res.status(201).json({ article });
  } catch (error) {
    if (error instanceof ArticleServiceError) {
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

  const parsedBody = updateArticleSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    // 게시글 수정
    const article = await updateArticle({ id: parsedId, ...parsedBody.data });
    return res.json({ article });
  } catch (error) {
    if (error instanceof ArticleServiceError) {
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
    // 게시글 삭제
    await deleteArticle(parsedId);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof ArticleServiceError) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

export default router;
