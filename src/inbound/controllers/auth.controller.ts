import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthServiceType } from "../../application/services/auth.service.js";
import { signInDataSchema, signUpDataSchema } from "../schemas/auth.schemas.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";

export const createAuthController = (
  signIn: AuthServiceType["signIn"],
  signUp: AuthServiceType["signUp"],
) => {
  const router = Router();

  router.post(
    "/signin",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signInDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      const token = await signIn(data);

      return res.json({ token });
    },
  );

  router.post(
    "/signup",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signUpDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      const token = await signUp(data);

      return res.json({ token });
    },
  );

  router.post("/signout", (req: Request, res: Response, next: NextFunction) => {
    return res.json({});
  });

  return { router };
};
