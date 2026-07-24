import { randomUUID } from "crypto";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IJwtUtil } from "../../shared/contracts/jwt-util.contract.js";
import { IHashUtil } from "../../shared/contracts/hash-util.contract.js";
import { ICryptoUtil } from "../../shared/contracts/crypto-util.contract.js";
import { IGoogleUtil } from "../../shared/contracts/google-util.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

const ACCESS_TOKEN_EXPIRES = 60 * 60; // 1시간
const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7일

export const createAuthService = (
  findUserByEmail: IUserRepo["findUserByEmail"],
  createUser: IUserRepo["createUser"],
  signJwt: IJwtUtil["signJwt"],
  hashUtil: IHashUtil,
  updateRefreshToken: IUserRepo["updateRefreshToken"],
  findUserByRefreshToken: IUserRepo["findUserByRefreshToken"],
  verifyJwt: IJwtUtil["verifyJwt"],
  cryptoUtil: ICryptoUtil,
  findUserByGoogleId: IUserRepo["findUserByGoogleId"],
  verifyGoogleCredential: IGoogleUtil["verifyCredential"],
  linkGoogleId: IUserRepo["linkGoogleId"],
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

    // Refresh를 해시 후 DB에 저장 (원본 토큰은 클라이언트에만 존재)
    await updateRefreshToken(foundUser.id, cryptoUtil.hash(refreshToken));

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

    // 입력 토큰을 해시해서 DB 저장값과 비교
    const user = await findUserByRefreshToken(cryptoUtil.hash(refreshToken));
    if (!user) {
      // 토큰 재사용 공격 감지 — 해당 유저의 저장된 토큰 즉시 폐기
      await updateRefreshToken(payload.userId, null);
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
    try {
      // 서버에 저장된 refresh 토큰 폐기
      await updateRefreshToken(userId, null);
    } catch (err) {
      throw new TechnicalException(
        "로그아웃에 실패했습니다",
        TechnicalExceptionCode.LOGOUT_FAILED,
        err,
      );
    }
  };

  const googleSignIn = async (credential: string) => {
    // Google credential 검증 → { googleId, email, name }
    const { googleId, email, name } = await verifyGoogleCredential(credential);

    // 1단계: googleId로 기존 Google 연동 사용자 조회
    let user = await findUserByGoogleId(googleId);

    if (user === null) {
      // 2단계: 동일 이메일 계정 조회 → 있으면 googleId 연결
      const existingUser = await findUserByEmail(email);
      if (existingUser !== null) {
        await linkGoogleId(existingUser.id, googleId);
        user = existingUser;
      } else {
        // 3단계: 완전 신규 사용자 생성 (동시 요청으로 이메일 중복 시 BusinessException으로 변환)
        try {
          user = await createUser({
            email,
            username: name,
            password: randomUUID(),
            googleId,
          });
        } catch (err) {
          if (
            err instanceof TechnicalException &&
            err.code === TechnicalExceptionCode.EMAIL_DUPLICATED
          ) {
            throw new BusinessException("이미 가입된 이메일입니다");
          }
          throw err;
        }
      }
    }

    // Access / Refresh 토큰 발급
    const accessToken = signJwt({
      data: { userId: user.id },
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = signJwt({
      data: { userId: user.id, type: "refresh" },
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });

    // Refresh 해시 후 DB 저장
    await updateRefreshToken(user.id, cryptoUtil.hash(refreshToken));

    return { accessToken, refreshToken };
  };

  return { signIn, signUp, refresh, signOut, googleSignIn };
};

export type AuthServiceType = ReturnType<typeof createAuthService>;
