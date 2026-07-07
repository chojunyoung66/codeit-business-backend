import { User } from "../generated/prisma/client.js";
import type { UserRepo } from "./contracts/user.repo.interface.js";
import type { SignJwt, AuthService } from "./contracts/auth.service.interface.js";

export const createAuthService = (userRepo: UserRepo, signJwt: SignJwt): AuthService => {
  const signInService = async (params: { email: string; password: string }) => {
    const { email, password } = params;

    const foundUser = await userRepo.findUserByEmail(email);
    if (!foundUser || (foundUser as any).password !== password) {
      throw new Error("이메일 또는 비밀번호가 일치하지 않습니다");
    }

    const token = signJwt({ userId: (foundUser as any).id }, 3600);

    return token;
  };

  return { signInService };
};