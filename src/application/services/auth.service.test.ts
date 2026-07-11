import { jest, describe, test, expect } from "@jest/globals";
import { createAuthService } from "./auth.service.js";
import type { IUserRepo } from "../contracts/user-repo.contract.js";
import type { IJwtUtil } from "../../shared/contracts/jwt-util.contract.js";
import type { IHashUtil } from "../../shared/contracts/hash-util.contract.js";

describe("로그인", () => {
  test("이메일과 비밀번호가 일치하면 JWT 토큰을 반환한다", async () => {
    // 가짜 데이터 준비
    const fakeUser = {
      id: 1,
      email: "asd@asd.com",
      password: "hashed_password",
      username: "nick",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeToken = "asd";

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(fakeUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(fakeUser);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockReturnValue(fakeToken);
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(true),
    };

    // 가짜 데이터를 주입해서 가상의 프로세스 검증
    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );
    const token = await signInService({
      email: "asd@asd.com",
      password: "1234",
    });

    // 검증 결과가 예상과 같은지 확인
    expect(token).toBe(fakeToken);
    expect(fakeFindUserByEmail).toHaveBeenCalledWith("asd@asd.com");
    expect(fakeBcryptUtil.compare).toHaveBeenCalledWith({
      password: "1234",
      hashedPassword: "hashed_password",
    });
    expect(fakeSignJwt).toHaveBeenCalledWith({
      data: { userId: fakeUser.id },
      expiresIn: 3600,
    });
  });

  test("존재하지 않는 이메일이면 에러를 던지고 JWT를 발급하지 않는다", async () => {
    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "notfound@asd.com", password: "1234" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("findUserByEmail이 undefined를 반환하면 에러를 던지고 JWT를 발급하지 않는다", async () => {
    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(undefined as never);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "1234" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("비밀번호가 일치하지 않으면 에러를 던지고 JWT를 발급하지 않는다", async () => {
    const fakeUser = {
      id: 1,
      email: "asd@asd.com",
      password: "hashed_password",
      username: "nick",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(fakeUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(fakeUser);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "wrong-password" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("findUserByEmail이 거부(reject)되면 signInService도 해당 에러를 그대로 전파한다", async () => {
    const dbError = new Error("DB 연결 실패");

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockRejectedValue(dbError);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "1234" }),
    ).rejects.toThrow("DB 연결 실패");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });
});

describe("회원가입", () => {
  test("존재하지 않는 이메일이면 새 사용자를 생성하고 JWT 토큰을 반환한다", async () => {
    const newUser = {
      id: 2,
      email: "newuser@asd.com",
      password: "hashed_password",
      username: "newuser@asd.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeToken = "new-token";

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(newUser);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockReturnValue(fakeToken);
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_password"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );
    const token = await signUpService({
      email: "newuser@asd.com",
      password: "5678",
      username: "newuser@asd.com",
    });

    expect(token).toBe(fakeToken);
    expect(fakeFindUserByEmail).toHaveBeenCalledWith("newuser@asd.com");
    expect(fakeBcryptUtil.hash).toHaveBeenCalledWith({
      password: "5678",
      saltRounds: 10,
    });
    expect(fakeCreateUser).toHaveBeenCalledWith({
      email: "newuser@asd.com",
      password: "hashed_password",
      username: "newuser@asd.com",
    });
    expect(fakeSignJwt).toHaveBeenCalledWith({
      data: { userId: newUser.id },
      expiresIn: 3600,
    });
  });

  test("이미 가입된 이메일이면 에러를 던진다", async () => {
    const existingUser = {
      id: 1,
      email: "existing@asd.com",
      password: "hashed_password",
      username: "existing",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(existingUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("token");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signUpService({
        email: "existing@asd.com",
        password: "1234",
        username: "existing",
      }),
    ).rejects.toThrow("계정이 이미 존재합니다");
    expect(fakeCreateUser).not.toHaveBeenCalled();
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("createUser가 실패하면 에러를 전파한다", async () => {
    const dbError = new Error("DB 연결 실패");

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockRejectedValue(dbError);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("token");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_password"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signUpService({
        email: "newuser@asd.com",
        password: "1234",
        username: "newuser",
      }),
    ).rejects.toThrow("DB 연결 실패");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("findUserByEmail이 거부(reject)되면 signUpService도 해당 에러를 그대로 전파한다", async () => {
    const dbError = new Error("DB 조회 실패");

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockRejectedValue(dbError);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("token");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signUpService({
        email: "newuser@asd.com",
        password: "1234",
        username: "newuser",
      }),
    ).rejects.toThrow("DB 조회 실패");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("signJwt가 예외를 발생하면 해당 에러를 전파한다", async () => {
    const newUser = {
      id: 2,
      email: "newuser@asd.com",
      password: "hashed_password",
      username: "newuser@asd.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const jwtError = new Error("JWT 서명 실패");

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(newUser);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockImplementation(() => {
        throw jwtError;
      });
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_password"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signUpService({
        email: "newuser@asd.com",
        password: "1234",
        username: "newuser",
      }),
    ).rejects.toThrow("JWT 서명 실패");
  });

  test("newUser.id가 undefined면 undefined 전달", async () => {
    const newUser = {
      id: undefined,
      email: "newuser@asd.com",
      password: "hashed_password",
      username: "newuser@asd.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeToken = "new-token";

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(newUser as never);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockReturnValue(fakeToken);
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_password"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    const token = await signUpService({
      email: "newuser@asd.com",
      password: "1234",
      username: "newuser@asd.com",
    });

    expect(token).toBe(fakeToken);
    expect(fakeSignJwt).toHaveBeenCalledWith({
      data: { userId: undefined },
      expiresIn: 3600,
    });
  });

  test("bcryptUtil.compare가 거부(reject)되면 해당 에러를 전파한다", async () => {
    const bcryptError = new Error("bcrypt 비교 실패");
    const fakeUser = {
      id: 1,
      email: "asd@asd.com",
      password: "hashed_password",
      username: "nick",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(fakeUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockRejectedValue(bcryptError),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "1234" }),
    ).rejects.toThrow("bcrypt 비교 실패");
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("signJwt가 예외를 발생하면 해당 에러를 전파한다", async () => {
    const jwtError = new Error("JWT 서명 실패");
    const fakeUser = {
      id: 1,
      email: "asd@asd.com",
      password: "hashed_password",
      username: "nick",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(fakeUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockImplementation(() => {
        throw jwtError;
      });
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(true),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "1234" }),
    ).rejects.toThrow("JWT 서명 실패");
  });

  test("빈 문자열 비밀번호로 요청하면 bcryptUtil.compare에 빈 문자열이 전달된다", async () => {
    const fakeUser = {
      id: 1,
      email: "asd@asd.com",
      password: "hashed_password",
      username: "nick",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(fakeUser);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "asd@asd.com", password: "" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(fakeBcryptUtil.compare).toHaveBeenCalledWith({
      password: "",
      hashedPassword: "hashed_password",
    });
  });

  test("빈 문자열 이메일로 요청하면 findUserByEmail에 빈 문자열이 전달된다", async () => {
    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("asd");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signIn: signInService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signInService({ email: "", password: "1234" }),
    ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    expect(fakeFindUserByEmail).toHaveBeenCalledWith("");
  });

  test("bcryptUtil.hash가 거부(reject)되면 해당 에러를 전파한다", async () => {
    const bcryptError = new Error("bcrypt 해시 실패");

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue({} as never);
    const fakeSignJwt = jest.fn<IJwtUtil["signJwt"]>().mockReturnValue("token");
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockRejectedValue(bcryptError),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    await expect(
      signUpService({
        email: "newuser@asd.com",
        password: "1234",
        username: "newuser",
      }),
    ).rejects.toThrow("bcrypt 해시 실패");
    expect(fakeCreateUser).not.toHaveBeenCalled();
    expect(fakeSignJwt).not.toHaveBeenCalled();
  });

  test("빈 문자열 비밀번호로 요청하면 bcryptUtil.hash에 빈 문자열이 전달된다", async () => {
    const newUser = {
      id: 2,
      email: "newuser@asd.com",
      password: "hashed_password",
      username: "newuser@asd.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeToken = "new-token";

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(newUser);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockReturnValue(fakeToken);
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_empty"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    const token = await signUpService({
      email: "newuser@asd.com",
      password: "",
      username: "newuser@asd.com",
    });

    expect(token).toBe(fakeToken);
    expect(fakeBcryptUtil.hash).toHaveBeenCalledWith({
      password: "",
      saltRounds: 10,
    });
    expect(fakeCreateUser).toHaveBeenCalledWith({
      email: "newuser@asd.com",
      password: "hashed_empty",
      username: "newuser@asd.com",
    });
  });

  test("빈 문자열 이메일로 요청하면 findUserByEmail에 빈 문자열이 전달된다", async () => {
    const newUser = {
      id: 2,
      email: "",
      password: "hashed_password",
      username: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeToken = "new-token";

    const fakeFindUserByEmail = jest
      .fn<IUserRepo["findUserByEmail"]>()
      .mockResolvedValue(null);
    const fakeCreateUser = jest
      .fn<IUserRepo["createUser"]>()
      .mockResolvedValue(newUser);
    const fakeSignJwt = jest
      .fn<IJwtUtil["signJwt"]>()
      .mockReturnValue(fakeToken);
    const fakeBcryptUtil = {
      hash: jest.fn<IHashUtil["hash"]>().mockResolvedValue("hashed_password"),
      compare: jest.fn<IHashUtil["compare"]>().mockResolvedValue(false),
    };

    const { signUp: signUpService } = createAuthService(
      fakeFindUserByEmail,
      fakeCreateUser,
      fakeSignJwt,
      fakeBcryptUtil,
    );

    const token = await signUpService({
      email: "",
      password: "1234",
      username: "",
    });

    expect(token).toBe(fakeToken);
    expect(fakeFindUserByEmail).toHaveBeenCalledWith("");
  });
});