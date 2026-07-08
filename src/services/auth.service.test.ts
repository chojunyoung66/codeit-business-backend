import { jest, describe, test, expect } from "@jest/globals";
import * as bcrypt from "bcrypt";
import { createAuthService } from "./auth.service.js";
import type { User } from "../generated/prisma/client.js";
import type { JwtUtil } from "./contracts/jwt.util.interface.js";
import type { BcryptUtil } from "./contracts/bcrypt.util.interface.js";

const expectCreateUserCalledWithHashedPassword = (
  fakeCreateUser: { mock: { calls: Array<[Record<string, unknown>]> } },
  expected: { email: string; username?: string },
) => {
  const createdUserData = fakeCreateUser.mock.calls[0][0];

  expect(createdUserData).toEqual({
    email: expected.email,
    password: expect.stringMatching(/^\$2[aby]\$/),
    username: expected.username,
  });
};

describe("인증 서비스 테스트", () => {
  describe("signInService", () => {
    test("이메일과 비밀번호가 일치하면 JWT 토큰을 반환한다", async () => {
      // 가짜 데이터 준비
      const fakeUser = {
        id: 1,
        email: "asd@asd.com",
        password: "1234",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "asd";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(true),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      // 가짜 데이터를 주입해서 가상의 프로세스 검증
      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );
      const token = await signInService({
        email: "asd@asd.com",
        password: "1234",
      });

      // 검증 결과가 예상과 같은지 확인
      expect(token).toBe(fakeToken);
    });

    test("사용자가 존재하지 않으면 에러를 던진다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signInService({
          email: "notfound@asd.com",
          password: "1234",
        }),
      ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    });

    test("비밀번호가 일치하지 않으면 에러를 던진다", async () => {
      const fakeUser = {
        id: 1,
        email: "asd@asd.com",
        password: "1234",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(false),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signInService({
          email: "asd@asd.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow("이메일 또는 비밀번호가 일치하지 않습니다");
    });

    test("저장된 비밀번호가 해시된 값이어도 로그인할 수 있다", async () => {
      const fakeUser = {
        id: 1,
        email: "asd@asd.com",
        password: await bcrypt.hash("1234", 10),
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "asd";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(true),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      const token = await signInService({
        email: "asd@asd.com",
        password: "1234",
      });

      expect(token).toBe(fakeToken);
    });

    test("findUserByEmail이 실패하면 에러를 전파한다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockRejectedValue(new Error("데이터베이스 연결 실패"));
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signInService({
          email: "test@asd.com",
          password: "password123",
        }),
      ).rejects.toThrow("데이터베이스 연결 실패");
    });

    test("bcryptUtil.compare가 실패하면 에러를 전파한다", async () => {
      const fakeUser = {
        id: 1,
        email: "asd@asd.com",
        password: "hashedPassword",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockRejectedValue(new Error("bcrypt 비교 실패")),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signInService({
          email: "asd@asd.com",
          password: "password",
        }),
      ).rejects.toThrow("bcrypt 비교 실패");
    });

    test("jwtUtil.sign이 실패하면 에러를 전파한다", async () => {
      const fakeUser = {
        id: 1,
        email: "asd@asd.com",
        password: "1234",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockImplementation(() => {
            throw new Error("JWT 서명 실패");
          }),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(true),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signInService({
          email: "asd@asd.com",
          password: "1234",
        }),
      ).rejects.toThrow("JWT 서명 실패");
    });
  });

  describe("signUpService", () => {
    test("새 사용자를 생성하고 JWT 토큰을 반환한다", async () => {
      const newUser = {
        id: 1,
        email: "newuser@asd.com",
        password: "password123",
        username: "newuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      const token = await signUpService({
        email: "newuser@asd.com",
        password: "password123",
        username: "newuser",
      });

      expect(token).toBe(fakeToken);
      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: "newuser@asd.com",
        username: "newuser",
      });
    });

    test("새 사용자를 생성할 때 비밀번호를 해시해서 저장한다", async () => {
      const newUser = {
        id: 1,
        email: "newuser@asd.com",
        password: "hashedPassword",
        username: "newuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue("token123"),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: "newuser@asd.com",
        password: "password123",
        username: "newuser",
      });

      const createdUserData = fakeCreateUser.mock.calls[0][0];
      expect(createdUserData.password).not.toBe("password123");
      expect(createdUserData.password).toMatch(/^\$2[aby]\$/);
    });

    test("이미 등록된 이메일이면 에러를 던진다", async () => {
      const existingUser = {
        id: 1,
        email: "existing@asd.com",
        password: "password123",
        username: "existing",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(existingUser as User);
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signUpService({
          email: "existing@asd.com",
          password: "password123",
          username: "existing",
        }),
      ).rejects.toThrow("이미 등록된 이메일입니다.");
    });

    test("findUserByEmail이 실패하면 에러를 전파한다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockRejectedValue(new Error("데이터베이스 연결 실패"));
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signUpService({
          email: "test@asd.com",
          password: "password123",
          username: "testuser",
        }),
      ).rejects.toThrow("데이터베이스 연결 실패");
    });

    test("createUser가 실패하면 에러를 전파한다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockRejectedValue(new Error("사용자 생성 실패"));
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signUpService({
          email: "test@asd.com",
          password: "password123",
          username: "testuser",
        }),
      ).rejects.toThrow("사용자 생성 실패");
    });

    test("signJwt가 실패하면 에러를 전파한다", async () => {
      const newUser = {
        id: 1,
        email: "test@asd.com",
        password: "password123",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockImplementation(() => {
            throw new Error("JWT 서명 실패");
          }),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signUpService({
          email: "test@asd.com",
          password: "password123",
          username: "testuser",
        }),
      ).rejects.toThrow("JWT 서명 실패");
    });

    test("username을 생략하면 undefined로 전달된다", async () => {
      const newUser = {
        id: 1,
        email: "test@asd.com",
        password: "password123",
        username: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as unknown as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      const token = await signUpService({
        email: "test@asd.com",
        password: "password123",
      });

      expect(token).toBe(fakeToken);
      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: "test@asd.com",
        username: undefined,
      });
    });

    test("username이 빈 문자열이면 그대로 전달된다", async () => {
      const newUser = {
        id: 1,
        email: "test@asd.com",
        password: "password123",
        username: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      const token = await signUpService({
        email: "test@asd.com",
        password: "password123",
        username: "",
      });

      expect(token).toBe(fakeToken);
      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: "test@asd.com",
        username: "",
      });
    });

    test("빈 문자열 이메일도 중복 확인을 수행한다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue({
          id: 1,
          email: "",
          password: "password123",
          username: "testuser",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue("token123"),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: "",
        password: "password123",
        username: "testuser",
      });

      expect(fakeFindUserByEmail).toHaveBeenCalledWith("");
    });

    test("빈 문자열 비밀번호도 생성에 전달된다", async () => {
      const newUser = {
        id: 1,
        email: "test@asd.com",
        password: "",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      const token = await signUpService({
        email: "test@asd.com",
        password: "",
        username: "testuser",
      });

      expect(token).toBe(fakeToken);
      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: "test@asd.com",
        username: "testuser",
      });
    });

    test("signJwt를 정확한 만료 시간(3600초)과 함께 호출한다", async () => {
      const newUser = {
        id: 42,
        email: "test@asd.com",
        password: "password123",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: "test@asd.com",
        password: "password123",
        username: "testuser",
      });

      expect(fakeJwtUtil.sign).toHaveBeenCalledWith({ userId: 42 }, 3600);
    });

    test("signJwt 호출 시 createUser에서 반환된 userId를 사용한다", async () => {
      const newUser = {
        id: 999,
        email: "test@asd.com",
        password: "password123",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: "test@asd.com",
        password: "password123",
        username: "testuser",
      });

      expect(fakeJwtUtil.sign).toHaveBeenCalledWith({ userId: 999 }, 3600);
    });

    test("특수 문자가 포함된 이메일로 중복 확인을 수행한다", async () => {
      const specialEmail = "test+tag@example.co.uk";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue({
          id: 1,
          email: specialEmail,
          password: "password123",
          username: "testuser",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue("token123"),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: specialEmail,
        password: "password123",
        username: "testuser",
      });

      expect(fakeFindUserByEmail).toHaveBeenCalledWith(specialEmail);
      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: specialEmail,
        username: "testuser",
      });
    });

    test("매우 긴 이메일 문자열도 중복 확인을 수행한다", async () => {
      const longEmail = "a".repeat(100) + "@example.com";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue({
          id: 1,
          email: longEmail,
          password: "password123",
          username: "testuser",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue("token123"),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: longEmail,
        password: "password123",
        username: "testuser",
      });

      expect(fakeFindUserByEmail).toHaveBeenCalledWith(longEmail);
    });

    test("매우 긴 비밀번호 문자열도 생성에 전달된다", async () => {
      const longPassword = "p".repeat(1000);
      const newUser = {
        id: 1,
        email: "test@asd.com",
        password: longPassword,
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "token123";

      const fakeCreateUser = jest
        .fn<
          (userData: {
            email: string;
            password: string;
            username?: string;
          }) => Promise<User>
        >()
        .mockResolvedValue(newUser as User);
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockResolvedValue("$2a$10$hashedPasswordFromBcryptUtil1234567890"),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: fakeCreateUser,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signUpService({
        email: "test@asd.com",
        password: longPassword,
        username: "testuser",
      });

      expectCreateUserCalledWithHashedPassword(fakeCreateUser, {
        email: "test@asd.com",
        username: "testuser",
      });
    });

    test("bcryptUtil.hash가 실패하면 에러를 전파한다", async () => {
      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(null);
      const fakeJwtUtil = {
        sign: jest.fn(),
      } as unknown as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest.fn(),
        hash: jest
          .fn<(password: string, saltRounds: number) => Promise<string>>()
          .mockRejectedValue(new Error("bcrypt 해시 실패")),
      } as unknown as BcryptUtil;

      const { signUpService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await expect(
        signUpService({
          email: "test@asd.com",
          password: "password123",
          username: "testuser",
        }),
      ).rejects.toThrow("bcrypt 해시 실패");
    });

    test("signInService 호출 시 정확한 만료 시간(3600초)과 함께 JWT를 호출한다", async () => {
      const fakeUser = {
        id: 42,
        email: "asd@asd.com",
        password: "1234",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "asd";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(true),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signInService({
        email: "asd@asd.com",
        password: "1234",
      });

      expect(fakeJwtUtil.sign).toHaveBeenCalledWith({ userId: 42 }, 3600);
    });

    test("signInService 호출 시 createUser에서 반환된 userId를 사용한다", async () => {
      const fakeUser = {
        id: 999,
        email: "asd@asd.com",
        password: "1234",
        username: "nick",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const fakeToken = "asd";

      const fakeFindUserByEmail = jest
        .fn<(email: string) => Promise<User | null>>()
        .mockResolvedValue(fakeUser as User);
      const fakeJwtUtil = {
        sign: jest
          .fn<(data: string | Buffer | object, expiresIn: number) => string>()
          .mockReturnValue(fakeToken),
      } as JwtUtil;
      const fakeBcryptUtil = {
        compare: jest
          .fn<
            (inputPassword: string, storedPassword: string) => Promise<boolean>
          >()
          .mockResolvedValue(true),
        hash: jest.fn(),
      } as unknown as BcryptUtil;

      const { signInService } = createAuthService(
        {
          findUserByEmail: fakeFindUserByEmail,
          createUser: jest.fn() as any,
          updateUser: jest.fn() as any,
          deleteUser: jest.fn() as any,
        },
        fakeJwtUtil,
        fakeBcryptUtil,
      );

      await signInService({
        email: "asd@asd.com",
        password: "1234",
      });

      expect(fakeJwtUtil.sign).toHaveBeenCalledWith({ userId: 999 }, 3600);
    });
  });
});
