import { Router, Request, Response } from "express";
import { createArticleRepo } from "../repos/article.repo.js";
import { prismaClient } from "../db/prisma.js";

const router = Router();

const articleRepo = createArticleRepo(prismaClient);

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