import type { UserRepo } from "./user.repo.interface.js";
import type { JwtUtil } from "./jwt.util.interface.js";
import type { BcryptUtil } from "./bcrypt.util.interface.js";

export type SignInParams = { email: string; password: string };
export type SignUpParams = {
  email: string;
  password: string;
  username?: string;
};
export type SignJwt = (
  data: string | Buffer | object,
  expiresIn: number,
) => string;

export interface AuthService {
  signInService(params: SignInParams): Promise<string>;
  signUpService(params: SignUpParams): Promise<string>;
}

export type CreateAuthService = (
  userRepo: UserRepo,
  jwtUtil: JwtUtil,
  bcryptUtil: BcryptUtil,
) => AuthService;
