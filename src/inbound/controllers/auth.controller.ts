import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AuthServiceType } from "../../application/services/auth.service.js";
import {
  signInDataSchema,
  signUpDataSchema,
  bearerTokenSchema,
  googleSignInBodySchema,
} from "../schemas/auth.schemas.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import { AuthMiddlewareType } from "../middlewares/auth.middleware.js";

export const createAuthController = (
  signIn: AuthServiceType["signIn"],
  signUp: AuthServiceType["signUp"],
  signOut: AuthServiceType["signOut"],
  refresh: AuthServiceType["refresh"],
  authMiddleware: AuthMiddlewareType,
  googleSignIn: AuthServiceType["googleSignIn"],
) => {
  const router = Router();

  router.post(
    "/signin",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signInDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      const { accessToken, refreshToken } = await signIn(data);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth",
        secure: process.env.NODE_ENV === "development" ? false : true,
        signed: false,
      });

      return res.json({ token: accessToken });
    },
  );

  router.post(
    "/signup",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signUpDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      await signUp(data);

      return res.json({});
    },
  );

  router.post(
    "/signout",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      // 저장된 리프레시 토큰을 null로 변경
      await signOut(req.userId!);

      // 리프레시 토큰이 저장된 브라우저 쿠키 삭제를 클라이언트에게 알림
      res.clearCookie("refreshToken", { path: "/api/auth" });

      return res.json({});
    },
  );

  router.post(
    "/refresh",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = bearerTokenSchema.safeParse({
        token: req.cookies?.refreshToken,
      });
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      const { accessToken, refreshToken } = await refresh(data.token);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth",
        secure: process.env.NODE_ENV === "development" ? false : true,
        signed: false,
      });

      return res.json({ token: accessToken });
    },
  );

  router.post(
    "/google",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = googleSignInBodySchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      const { accessToken, refreshToken } = await googleSignIn(data.credential);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/api/auth",
        secure: process.env.NODE_ENV === "development" ? false : true,
        signed: false,
      });

      // 프론트엔드는 { token } 형태를 기대함
      return res.json({ token: accessToken });
    },
  );

  return { router };
};
