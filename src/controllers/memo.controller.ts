import { Router, Request, Response } from "express";
import { createArticleRepo } from "../repos/article.repo.js";

const router = Router();

const articleRepo = createArticleRepo();

router.get("/", async (_req: Request, res: Response) => {
  const articles = await articleRepo.findAll();
  return res.json({ articles });
});

router.post("/", async (req: Request, res: Response) => {
  const { userId, title, content } = req.body;
  const article = await articleRepo.createArticle({ userId, title, content });
  return res.status(201).json({ article });
});

export default router;