import jwt from "jsonwebtoken";
import type { JwtUtil } from "../application/contracts/jwt.util.interface.js";

export const createJwtUtil = (): JwtUtil => {
  const sign = (data: string | Buffer | object, expiresIn: number): string => {
    return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
  };

  return { sign };
};

// 하위 호환성을 위한 기존 함수
export const signJwt = (data: string | Buffer | object, expiresIn: number) => {
  return jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
};
