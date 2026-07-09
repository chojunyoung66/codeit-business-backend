import jwt from "jsonwebtoken";
import type { JwtUtil } from "../application/contracts/jwt.util.interface.js";

export const createJwtUtil = (): JwtUtil => {
  const sign = (data: string | Buffer | object, expiresIn: number): string => {
    return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
  };

  const verify = (token: string): { userId: number } => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: number;
      };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("토큰이 만료되었습니다");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("유효하지 않은 토큰입니다");
      }
      throw error;
    }
  };

  return { sign, verify };
};

// 하위 호환성을 위한 기존 함수
export const signJwt = (data: string | Buffer | object, expiresIn: number) => {
  return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
};
