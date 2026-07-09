import { Router, Request, Response, NextFunction } from "express";
import type { UserRepo } from "../../application/contracts/user.repo.interface.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

export const createUserController = (userRepo: UserRepo) => {
  const router = Router();

  router.get("/me", authMiddleware, asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepo.findUserById(req.userId || 0);
    if (!user) {
      return res.status(404).json({
        message: "사용자를 찾을 수 없습니다.",
      });
    }

    return res.json({
      me: {
        userId: req.userId,
        ...user,
      },
    });
  }));

  return router;
};
