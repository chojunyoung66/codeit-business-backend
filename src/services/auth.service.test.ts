import { jest, describe, test, expect } from "@jest/globals";
import { createAuthService } from "./auth.service.js";
import type { User } from "../generated/prisma/client.js";

describe("인증 서비스 테스트", () => {
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
    const fakeToken = "asd"

    const fakeFindUserByEmail = jest
      .fn<(email: string) => Promise<User | null>>()
      .mockResolvedValue(fakeUser as User);
    const fakeSignJwt = jest
      .fn<(data: string | Buffer | object, expiresIn: number) => string>()
      .mockReturnValue(fakeToken);

      // 가짜 데이터를 주입해서 가상의 프로세스 검증
    const { signInService } = createAuthService(
      {
        findUserByEmail: fakeFindUserByEmail,
        createUser: jest.fn() as any,
        updateUser: jest.fn() as any,
        deleteUser: jest.fn() as any,
      },
      fakeSignJwt,
    );
    const token = await signInService({
      email: "asd@asd.com",
      password: "1234",
    });

    // 검증 결과가 예상과 같은지 확인
    expect(token).toBe(fakeToken);
  });
});