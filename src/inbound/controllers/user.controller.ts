import { Router, Request, Response, NextFunction } from "express";
import { UserServiceType } from "../../application/services/user.service.js";
import { MemoServiceType } from "../../application/services/memo.service.js";
import { AuthMiddlewareType } from "../middlewares/auth.middleware.js";

export const createUserController = (
  getMe: UserServiceType["getMe"],
  analyzeMemos: MemoServiceType["analyzeMemos"],
  authMiddleware: AuthMiddlewareType,
) => {
  const router = Router();

  router.get(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      const user = await getMe(req.userId!);
      const analysis = await analyzeMemos(req.userId!);
      res.json({ me: user, analysis });
    },
  );

  return { router };
};
