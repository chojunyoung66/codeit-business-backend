import type {
  AuthService,
  SignInParams,
  SignUpParams,
} from "../auth.service.interface.js";

export const createAuthServiceMock = (token = "mock-token"): AuthService => {
  return {
    signInService: async (_params: SignInParams) => token,
    signUpService: async (_params: SignUpParams) => token,
  };
};
