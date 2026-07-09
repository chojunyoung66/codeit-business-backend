import { Request, Response, NextFunction } from "express";
import { createJwtUtil } from "../../utils/jwt.util.js";
import { BusinessException } from "../../shared/business.exception.js";
import { TechnicalException } from "../../shared/technical.exception.js";

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
    // 토큰이 없으면 비즈니스 에러
    throw new BusinessException("인증 토큰이 필요합니다.");
  }

  const token = authHeader.substring(7);

  try {
    // JWT 토큰 검증
    const jwtUtil = createJwtUtil();
    const decoded = jwtUtil.verify(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // JWT 검증 에러는 비즈니스 에러 (사용자의 잘못된 입력)
    if (error instanceof Error) {
      if (
        error.message.includes("만료") ||
        error.message.includes("유효하지 않은")
      ) {
        throw new BusinessException(error.message);
      }
    }
    // 예상치 못한 에러는 기술적 에러
    throw new TechnicalException("인증 처리 중 오류가 발생했습니다.");
  }
};
