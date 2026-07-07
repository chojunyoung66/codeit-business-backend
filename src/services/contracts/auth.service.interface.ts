import type { User } from "../../generated/prisma/client.js";
import type { UserRepo } from "./user.repo.interface.js";

export type SignInParams = { email: string; password: string };
export type SignJwt = (data: string | Buffer | object, expiresIn: number) => string;

export interface AuthService {
  signInService(params: SignInParams): Promise<string>;
}

export type CreateAuthService = (userRepo: UserRepo, signJwt: SignJwt) => AuthService;
