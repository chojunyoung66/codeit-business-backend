import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { createAuthService } from "./auth.service.js";
import type { IUserRepo } from "../contracts/user-repo.contract.js";
import type { IHashUtil } from "../../shared/contracts/hash-util.contract.js";
import type { IJwtUtil } from "../../shared/contracts/jwt-util.contract.js";
import { TechnicalException, TechnicalExceptionCode } from "../../shared/exceptions/technical.exception.js";
import type { ICryptoUtil } from "../../shared/contracts/crypto-util.contract.js";

const fakeUser = {
  id: 1,
  email: "asd@asd.com",
  password: "hashed_password",
  username: "nick",
  refreshToken: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createDeps = () => {
  const findUserByEmail = jest
    .fn<IUserRepo["findUserByEmail"]>()
    .mockResolvedValue(null);
  const createUser = jest
    .fn<IUserRepo["createUser"]>()
    .mockResolvedValue(fakeUser);
  const signJwt = jest
    .fn<IJwtUtil["signJwt"]>()
    .mockReturnValueOnce("access_token")
    .mockReturnValueOnce("refresh_token");
  const hashUtil = {
    hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
    compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(true),
  };
  const updateRefreshToken = jest
    .fn<IUserRepo["updateRefreshToken"]>()
    .mockResolvedValue(undefined);
  const findUserByRefreshToken = jest
    .fn<IUserRepo["findUserByRefreshToken"]>()
    .mockResolvedValue(null);
  const verifyJwt = jest.fn<IJwtUtil["verifyJwt"]>();
  const cryptoUtil: ICryptoUtil = {
    hash: jest.fn<ICryptoUtil["hash"]>().mockImplementation((token) => `hashed_${token}`),
  };

  const service = createAuthService(
    findUserByEmail,
    createUser,
    signJwt,
    hashUtil,
    updateRefreshToken,
    findUserByRefreshToken,
    verifyJwt,
    cryptoUtil,
  );

  return {
    service,
    findUserByEmail,
    createUser,
    signJwt,
    hashUtil,
    updateRefreshToken,
    findUserByRefreshToken,
    verifyJwt,
    cryptoUtil,
  };
};

let deps: ReturnType<typeof createDeps>;

beforeEach(() => {
  deps = createDeps();
});

describe("로그인", () => {
  test("해피패스: access/refresh를 발급하고 refresh를 DB에 저장한다", async () => {
    deps.findUserByEmail.mockResolvedValue(fakeUser);

    const result = await deps.service.signIn({ email: "asd@asd.com", password: "1234" });

    expect(result).toEqual({ accessToken: "access_token", refreshToken: "refresh_token" });
    expect(deps.signJwt).toHaveBeenCalledWith({ data: { userId: fakeUser.id }, expiresIn: 15 * 60 });
    expect(deps.signJwt).toHaveBeenCalledWith({ data: { userId: fakeUser.id, type: "refresh" }, expiresIn: 7 * 24 * 60 * 60 });
    expect(deps.updateRefreshToken).toHaveBeenCalledWith(fakeUser.id, "hashed_refresh_token");
  });

  test("존재하지 않는 이메일이면 에러를 던지고 JWT를 발급하지 않는다", async () => {
    await expect(
      deps.service.signIn({ email: "notfound@asd.com", password: "1234" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(deps.signJwt).not.toHaveBeenCalled();
  });

  test("비밀번호가 일치하지 않으면 에러를 던지고 JWT를 발급하지 않는다", async () => {
    deps.findUserByEmail.mockResolvedValue(fakeUser);
    deps.hashUtil.compare.mockResolvedValue(false);

    await expect(
      deps.service.signIn({ email: "asd@asd.com", password: "wrong" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(deps.signJwt).not.toHaveBeenCalled();
  });
});

describe("회원가입", () => {
  test("해피패스: 새 사용자를 생성하고 토큰은 발급하지 않는다", async () => {
    await deps.service.signUp({ email: "newuser@asd.com", password: "5678", username: "newuser" });

    expect(deps.hashUtil.hash).toHaveBeenCalledWith({ password: "5678", saltRounds: 10 });
    expect(deps.createUser).toHaveBeenCalledWith({ email: "newuser@asd.com", password: "hashed", username: "newuser" });
    expect(deps.signJwt).not.toHaveBeenCalled();
  });

  test("이미 가입된 이메일이면 에러를 던진다", async () => {
    deps.findUserByEmail.mockResolvedValue(fakeUser);

    await expect(
      deps.service.signUp({ email: "asd@asd.com", password: "1234", username: "nick" }),
    ).rejects.toThrow("계정이 이미 존재합니다");
    expect(deps.createUser).not.toHaveBeenCalled();
  });
});

describe("토큰 갱신", () => {
  test("해피패스: refresh 검증 후 기존 토큰을 폐기하고 새 access/refresh를 발급한다", async () => {
    deps.verifyJwt.mockReturnValue({ userId: 1, type: "refresh" });
    deps.findUserByRefreshToken.mockResolvedValue(fakeUser);
    deps.signJwt.mockReset().mockReturnValueOnce("new_access").mockReturnValueOnce("new_refresh");

    const result = await deps.service.refresh("old_refresh");

    expect(deps.verifyJwt).toHaveBeenCalledWith("old_refresh");
    expect(deps.findUserByRefreshToken).toHaveBeenCalledWith("hashed_old_refresh");
    expect(deps.updateRefreshToken).toHaveBeenCalledWith(1, "new_refresh");
    expect(result).toEqual({ accessToken: "new_access", refreshToken: "new_refresh" });
  });

  test("서명이 위조된 토큰이면 에러를 던지고 새 토큰을 발급하지 않는다", async () => {
    deps.verifyJwt.mockImplementation(() => { throw new Error("invalid signature"); });

    await expect(deps.service.refresh("forged_token")).rejects.toThrow("유효하지 않은 리프레시 토큰입니다");
    expect(deps.signJwt).not.toHaveBeenCalled();
    expect(deps.updateRefreshToken).not.toHaveBeenCalled();
  });

  test("만료된 토큰이면 에러를 던지고 새 토큰을 발급하지 않는다", async () => {
    deps.verifyJwt.mockImplementation(() => { throw new Error("jwt expired"); });

    await expect(deps.service.refresh("expired_token")).rejects.toThrow("유효하지 않은 리프레시 토큰입니다");
    expect(deps.signJwt).not.toHaveBeenCalled();
    expect(deps.updateRefreshToken).not.toHaveBeenCalled();
  });

  test("DB에 없는 refresh면 저장된 토큰을 삭제하고 에러를 던진다", async () => {
    deps.verifyJwt.mockReturnValue({ userId: 1, type: "refresh" });
    deps.findUserByRefreshToken.mockResolvedValue(null);

    await expect(deps.service.refresh("stale_refresh")).rejects.toThrow("유효하지 않은 리프레시 토큰입니다");
    expect(deps.updateRefreshToken).toHaveBeenCalledWith(1, null);
    expect(deps.signJwt).not.toHaveBeenCalled();
  });
});

describe("로그아웃", () => {
  test("해피패스: 사용자 refresh 토큰을 DB에서 삭제한다", async () => {
    await deps.service.signOut(1);

    expect(deps.updateRefreshToken).toHaveBeenCalledWith(1, null);
  });

  test("리프레시 토큰 삭제가 실패하면 TechnicalException을 던진다", async () => {
    deps.updateRefreshToken.mockRejectedValue(new Error("DB connection lost"));

    await expect(deps.service.signOut(1)).rejects.toBeInstanceOf(TechnicalException);
    await expect(deps.service.signOut(1)).rejects.toMatchObject({
      code: TechnicalExceptionCode.LOGOUT_FAILED,
    });
  });

  test("이미 로그아웃된 사용자가 다시 로그아웃을 요청하면 정상 처리된다", async () => {
    await deps.service.signOut(1);
    await expect(deps.service.signOut(1)).resolves.toBeUndefined();
    expect(deps.updateRefreshToken).toHaveBeenCalledTimes(2);
  });
});
