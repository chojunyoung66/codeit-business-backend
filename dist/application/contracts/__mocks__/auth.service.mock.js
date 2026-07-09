export const createAuthServiceMock = (token = "mock-token") => {
  return {
    signInService: async (_params) => token,
    signUpService: async (_params) => token,
  };
};
