import { Router, Request, Response, NextFunction } from "express";
import { createArticleSchema, updateArticleSchema } from "../schemas/article.schema.js";
import type { ArticleService } from "../../application/contracts/article.service.interface.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

export const createArticleController = (articleService: ArticleService) => {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
      const articles = await articleService.getArticles();
      return res.json({ articles });
    }),
  );

  router.get(
    "/:id",
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const article = await articleService.getArticleById(id);
      return res.json({ article });
    }),
  );

  router.post(
    "/",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const parsedBody = createArticleSchema.parse(req.body);
      const article = await articleService.createArticle(parsedBody);
      return res.status(201).json({ article });
    }),
  );

  router.patch(
    "/:id",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      const parsedBody = updateArticleSchema.parse(req.body);
      const article = await articleService.updateArticle({ id, ...parsedBody });
      return res.json({ article });
    }),
  );

  router.delete(
    "/:id",
    authMiddleware,
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id as string, 10);
      await articleService.deleteArticle(id);
      return res.status(204).send();
    }),
  );

  return router;
};
