import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IJwtUtil } from "../../shared/contracts/jwt-util.contract.js";
import { IHashUtil } from "../../shared/contracts/hash-util.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

const ACCESS_TOKEN_EXPIRES = 15 * 60; // 15분
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7일

export const createAuthService = (
  findUserByEmail: IUserRepo["findUserByEmail"],
  createUser: IUserRepo["createUser"],
  signJwt: IJwtUtil["signJwt"],
  hashUtil: IHashUtil,
  updateRefreshToken: IUserRepo["updateRefreshToken"],
  findUserByRefreshToken: IUserRepo["findUserByRefreshToken"],
  verifyJwt: IJwtUtil["verifyJwt"],
) => {
  const signIn = async (params: { email: string; password: string }) => {
    const { email, password } = params;

    // 이메일로 사용자 조회
    const foundUser = await findUserByEmail(email);
    if (foundUser == null) {
      throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
    }

    // 비밀번호 검증
    const isPasswordValid = await hashUtil.compare({
      password: password,
      hashedPassword: foundUser.password,
    });
    if (!isPasswordValid) {
      throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
    }

    // Access / Refresh 토큰 발급
    const accessToken = signJwt({
      data: { userId: foundUser.id },
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = signJwt({
      data: { userId: foundUser.id, type: "refresh" },
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });

    // Refresh를 DB에 저장
    await updateRefreshToken(foundUser.id, refreshToken);

    return { accessToken, refreshToken };
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

    // 비밀번호 해싱
    const hashedPassword = await hashUtil.hash({
      password,
      saltRounds: 10,
    });

    try {
      // 사용자만 생성 (토큰은 로그인 시 발급)
      await createUser({
        email,
        password: hashedPassword,
        username,
      });
    } catch (err) {
      if (err instanceof TechnicalException) {
        if (err.code === TechnicalExceptionCode.EMAIL_DUPLICATED) {
          throw new BusinessException("계정이 이미 존재합니다");
        }
      }

      throw err;
    }
  };

  const refresh = async (refreshToken: string) => {
    // Refresh JWT 서명/만료 검증
    let payload: { userId?: number; type?: string };
    try {
      payload = verifyJwt(refreshToken) as { userId?: number; type?: string };
    } catch {
      throw new BusinessException("유효하지 않은 리프레시 토큰입니다");
    }

    if (payload.type !== "refresh" || typeof payload.userId !== "number") {
      throw new BusinessException("유효하지 않은 리프레시 토큰입니다");
    }

    // DB에 저장된 토큰과 일치하는지 확인
    const user = await findUserByRefreshToken(refreshToken);
    if (!user) {
      throw new BusinessException("유효하지 않은 리프레시 토큰입니다");
    }

    // Refresh Token Rotation: 새 access + 새 refresh 발급
    const accessToken = signJwt({
      data: { userId: user.id },
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const newRefreshToken = signJwt({
      data: { userId: user.id, type: "refresh" },
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });

    // 기존 refresh를 새 토큰으로 교체
    await updateRefreshToken(user.id, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  };

  const signOut = async (userId: number) => {
    // 서버에 저장된 refresh 토큰 폐기
    await updateRefreshToken(userId, null);
  };

  return { signIn, signUp, refresh, signOut };
};

export type AuthServiceType = ReturnType<typeof createAuthService>;
