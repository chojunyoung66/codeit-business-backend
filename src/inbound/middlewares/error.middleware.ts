import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { BusinessException } from "../../shared/business.exception.js";
import { TechnicalException } from "../../shared/technical.exception.js";

export const notFoundMiddleware = (
  _req: Request,
  _res: Response,
  _next: NextFunction,
) => {
  throw new BusinessException("존재하지 않는 api 요청입니다.");
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
        errors: err.issues.map((issue) => {
          const error: Record<string, any> = {
            path: issue.path,
            code: issue.code,
            message: issue.message,
          };
          if ("expected" in issue) {
            error.expected = (issue as any).expected;
          }
          return error;
        }),
      });
    } else if (err instanceof BusinessException) {
      res.status(401).json({ message: err.message });
    } else if (err instanceof TechnicalException) {
      res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
      console.error(err);
    } else {
      res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
      console.error(err);
    }
  }
};
