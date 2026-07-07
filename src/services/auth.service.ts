import { findUserByEmail } from "../repos/user.repo.js";
import { signJwt } from "../utils/jwt.util.js";

export const signInService = async (params: {
  email: string;
  password: string;
}) => {
  const { email, password } = params;

  const foundUser = await findUserByEmail(email);
  if (
    foundUser == undefined ||
    foundUser == null ||
    foundUser.password !== password
  ) {
    throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
  }

  const token = signJwt({ userId: foundUser }, 3600);

  return token;
};