import { Router, Request, Response, NextFunction } from "express";
import { signInDataSchema, signUpDataSchema } from "../schemas/auth.schema.js";
import { BusinessException } from "../../shared/business.exception.js";
import type { AuthService } from "../../application/contracts/auth.service.interface.js";

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

export const createAuthController = (authService: AuthService) => {
  const { signInService, signUpService } = authService;
  const router = Router();

  router.post("/signin", asyncHandler(async (req: Request, res: Response) => {
    const parsedBody = signInDataSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new BusinessException("요청 값이 올바르지 않습니다.");
    }

    const token = await signInService(parsedBody.data);
    return res.json({ token });
  }));

  router.post("/signup", asyncHandler(async (req: Request, res: Response) => {
    const parsedBody = signUpDataSchema.safeParse(req.body);
    if (!parsedBody.success) {
      throw new BusinessException("요청 값이 올바르지 않습니다.");
    }

    const token = await signUpService(parsedBody.data);
    return res.status(201).json({ token });
  }));

  router.post("/signout", (_req: Request, res: Response) => {
    return res.json({});
  });

  return router;
};