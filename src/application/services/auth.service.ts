import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IJwtUtil } from "../../shared/contracts/jwt-util.contract.js";
import { IHashUtil } from "../../shared/contracts/hash-util.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

export const createAuthService = (
  findUserByEmail: IUserRepo["findUserByEmail"],
  createUser: IUserRepo["createUser"],
  signJwt: IJwtUtil["signJwt"],
  hashUtil: IHashUtil,
) => {
  const signIn = async (params: { email: string; password: string }) => {
    const { email, password } = params;

    const foundUser = await findUserByEmail(email);
    if (foundUser == null) {
      throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
    }

    const isPasswordValid = await hashUtil.compare({
      password: password,
      hashedPassword: foundUser.password,
    });
    if (!isPasswordValid) {
      throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
    }

    const token = signJwt({ data: { userId: foundUser.id }, expiresIn: 3600 });

    return token;
  };

  const signUp = async (params: {
    email: string;
    password: string;
    username: string;
  }) => {
    const { email, password, username } = params;

    // 트래픽이 적은 경우에만 방어가 가능합니다.
    const foundUser = await findUserByEmail(email);
    if (foundUser !== null) {
      throw new BusinessException("계정이 이미 존재합니다.");
    }

    const hashedPassword = await hashUtil.hash({
      password,
      saltRounds: 10,
    });

    try {
      const newUser = await createUser({
        email,
        password: hashedPassword,
        username,
      });
      const token = signJwt({ data: { userId: newUser.id }, expiresIn: 3600 });
      return token;
    } catch (err) {
      if (err instanceof TechnicalException) {
        if (err.code === TechnicalExceptionCode.EMAIL_DUPLICATED) {
          throw new BusinessException("계정이 이미 존재합니다");
        }
      }

      throw err;
    }
  };

  return { signIn, signUp };
};

export type AuthServiceType = ReturnType<typeof createAuthService>;