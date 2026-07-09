import { Router, Request, Response } from "express";
import type { IUserRepo } from "../../application/contracts/user-repo.contract.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

export const createUserController = (userRepo: IUserRepo) => {
  const router = Router();

  router.get("/me", authMiddleware, async (req: Request, res: Response) => {
    const user = await userRepo.findUserById(req.userId || 0);
    res.json({
      me: {
        userId: req.userId,
        ...user,
      },
    });
  });

  return router;
};

export default createUserController(null as any);
