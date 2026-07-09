import jwt from "jsonwebtoken";
export const createJwtUtil = () => {
  const sign = (data, expiresIn) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
  };
  return { sign };
};
// 하위 호환성을 위한 기존 함수
export const signJwt = (data, expiresIn) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
};
