import type { AuthService } from "../auth.service.interface.js";
import type { SignInParams } from "../auth.service.interface.js";

export const createAuthServiceMock = (token = "mock-token"): AuthService => {
  return {
    signInService: async (_params: SignInParams) => token,
  };
};
