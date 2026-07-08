import * as bcrypt from "bcrypt";
import type { BcryptUtil } from "../services/contracts/bcrypt.util.interface.js";

export const createBcryptUtil = (): BcryptUtil => {
  const hash = async (
    password: string,
    saltRounds: number,
  ): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
  };

  const compare = async (
    inputPassword: string,
    storedPassword: string,
  ): Promise<boolean> => {
    // bcrypt로 해시된 비밀번호라면 bcrypt 비교를 사용
    if (storedPassword.startsWith("$2")) {
      return bcrypt.compare(inputPassword, storedPassword);
    }

    // 평문 비밀번호 처리 (레거시)
    return inputPassword === storedPassword;
  };

  return { hash, compare };
};
