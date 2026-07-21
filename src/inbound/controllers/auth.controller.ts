import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { z } from "zod";
import { AuthServiceType } from "../../application/services/auth.service.js";
import { signInDataSchema, signUpDataSchema } from "../schemas/auth.schemas.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import { getCookieValue } from "../../shared/utils/cookie.util.js";

const REFRESH_COOKIE_NAME = "refreshToken";
const REFRESH_COOKIE_PATH = "/api/auth/refresh";

const refreshCookieOptions = {
  httpOnly: true,
  path: REFRESH_COOKIE_PATH,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export const createAuthController = (
  signIn: AuthServiceType["signIn"],
  signUp: AuthServiceType["signUp"],
  refresh: AuthServiceType["refresh"],
  signOut: AuthServiceType["signOut"],
  authMiddleware: RequestHandler,
) => {
  const router = Router();

  router.post(
    "/signin",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signInDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      // Access는 JSON, Refresh는 HttpOnly 쿠키
      const result = await signIn(data);
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

      return res.json({ token: result.accessToken });
    },
  );

  router.post(
    "/signup",
    async (req: Request, res: Response, next: NextFunction) => {
      const { success, data, error } = signUpDataSchema.safeParse(req.body);
      if (success === false) {
        throw new BusinessException(z.prettifyError(error));
      }

      // 회원가입은 토큰 없이 계정만 생성
      await signUp(data);

      return res.json({});
    },
  );

  router.post(
    "/refresh",
    async (req: Request, res: Response, next: NextFunction) => {
      // Path 제한 쿠키에서 refresh 추출
      const refreshToken = getCookieValue(req, REFRESH_COOKIE_NAME);
      if (!refreshToken) {
        throw new BusinessException("유효하지 않은 리프레시 토큰입니다");
      }

      // 검증 + 로테이션
      const result = await refresh(refreshToken);
      res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);

      return res.json({ token: result.accessToken });
    },
  );

  router.post(
    "/signout",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      // DB refresh 폐기 + 브라우저 쿠키 삭제
      await signOut(req.userId!);
      res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);

      return res.json({});
    },
  );

  return { router };
};
