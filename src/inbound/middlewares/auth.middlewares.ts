import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "인증 토큰이 필요합니다.",
    });
  }

  const token = authHeader.substring(7);

  // 토큰 검증 (jwt.verify 기능 구현 필요)
  // 임시로 토큰이 있으면 userId를 추출하여 요청에 추가
  if (token) {
    req.userId = parseInt(req.headers["user-id"] as string) || 1;
  }

  next();
};
