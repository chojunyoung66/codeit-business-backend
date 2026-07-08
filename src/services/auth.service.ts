import type { UserRepo } from "./contracts/user.repo.interface.js";
import type {
  SignJwt,
  SignUpParams,
  AuthService,
} from "./contracts/auth.service.interface.js";

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

  const signUpService = async (params: SignUpParams) => {
    const { email, password, username } = params;

    const existingUser = await userRepo.findUserByEmail(email);
    if (existingUser) {
      throw new Error("이미 등록된 이메일입니다.");
    }

    const newUser = await userRepo.createUser({
      email,
      password,
      username,
    });

    const token = signJwt({ userId: (newUser as any).id }, 3600);

    return token;
  };

  return { signInService, signUpService };
};