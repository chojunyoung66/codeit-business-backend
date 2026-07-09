import { Request, Response, NextFunction } from "express";
import { BusinessException } from "../../shared/business.exception.js";
import { TechnicalException } from "../../shared/technical.exception.js";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err) {
    if (err instanceof BusinessException) {
      // 고객에게는 정직하게 문제 상황을 알려드리자.
      // 개발자에게는 안보낸다.
      res.status(401).json({ message: err.message });
    } else if (err instanceof TechnicalException) {
      // 고객에게는 대충 알려드리고
      res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
      // 개발자에게는 긴급 요청 보낸다: 오픈소스: sentry => 사내 슬랙으로 에러가 띠릭
      console.error(err);
    } else {
      // 개발자가 미처 생각하지 못한 깜놀 에러
      res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
      // 개발자에게는 긴급 요청 보낸다.
      console.error(err);
    }
  }
};