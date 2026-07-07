import jwt from "jsonwebtoken";

export const signJwt = (data: string | Buffer | object, expiresIn: number) => {
  jwt.sign(data, process.env.JWT_SECRET as string, { expiresIn });
};