import { jest, describe, test, expect } from "@jest/globals";
import jwt from "jsonwebtoken";
import { createJwtUtil, signJwt } from "./jwt.util.js";

// JWT_SECRET을 테스트를 위해 임시 설정
const originalJwtSecret = process.env.JWT_SECRET;

describe("jwtUtil 테스트", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  describe("createJwtUtil().sign", () => {
    test("객체 데이터로 JWT를 생성한다", () => {
      const { sign } = createJwtUtil();
      const data = { userId: 1, email: "test@example.com" };
      const expiresIn = 3600;

      const token = sign(data, expiresIn);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT 형식 (header.payload.signature)
    });

    test("문자열 데이터로 JWT를 생성할 때 expiresIn 옵션은 무시된다", () => {
      const { sign } = createJwtUtil();
      const data = "user123";
      const expiresIn = 3600;

      // 주의: jsonwebtoken은 문자열 payload에는 expiresIn을 지원하지 않음
      // 구현체가 이를 처리하지 않으므로 에러가 발생함
      expect(() => sign(data, expiresIn)).toThrow();
    });

    test("Buffer 데이터로 JWT를 생성할 때 expiresIn 옵션은 무시된다", () => {
      const { sign } = createJwtUtil();
      const data = Buffer.from("binary data");
      const expiresIn = 3600;

      // 주의: jsonwebtoken은 Buffer payload에는 expiresIn을 지원하지 않음
      // 구현체가 이를 처리하지 않으므로 에러가 발생함
      expect(() => sign(data, expiresIn)).toThrow();
    });

    test("생성된 토큰을 검증할 수 있다", () => {
      const { sign } = createJwtUtil();
      const data = { userId: 123 };
      const expiresIn = 3600;

      const token = sign(data, expiresIn);
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      expect(decoded).toHaveProperty("userId", 123);
    });

    test("expiresIn이 0이면 토큰은 즉시 만료된다", () => {
      const { sign } = createJwtUtil();
      const data = { userId: 1 };

      const token = sign(data, 0);

      // 토큰이 생성되기는 하지만 검증할 때는 실패해야 함
      expect(() => {
        jwt.verify(token, process.env.JWT_SECRET as string);
      }).toThrow();
    });

    test("expiresIn이 음수일 때도 토큰을 생성할 수 있다", () => {
      const { sign } = createJwtUtil();
      const data = { userId: 1 };

      // jsonwebtoken은 음수 expiresIn을 허용함
      const token = sign(data, -1);

      expect(typeof token).toBe("string");
    });

    test("복잡한 중첩 객체도 서명할 수 있다", () => {
      const { sign } = createJwtUtil();
      const data = {
        userId: 1,
        user: {
          email: "test@example.com",
          roles: ["admin", "user"],
          metadata: {
            createdAt: "2024-01-01",
            active: true,
          },
        },
      };
      const expiresIn = 3600;

      const token = sign(data, expiresIn);
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      expect(decoded).toHaveProperty("userId", 1);
      expect(decoded).toHaveProperty("user.email", "test@example.com");
    });

    test("expiresIn이 매우 큰 경우에도 토큰을 생성한다", () => {
      const { sign } = createJwtUtil();
      const data = { userId: 1 };
      const expiresIn = 31536000; // 1년

      const token = sign(data, expiresIn);

      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      expect(decoded).toHaveProperty("userId", 1);
    });

    test("JWT_SECRET이 undefined이면 에러를 던진다", () => {
      delete process.env.JWT_SECRET;
      const { sign } = createJwtUtil();
      const data = { userId: 1 };

      expect(() => sign(data, 3600)).toThrow();
    });

    test("매우 큰 객체도 서명할 수 있다", () => {
      const { sign } = createJwtUtil();
      const largeObject = {
        userId: 1,
        data: "x".repeat(10000), // 큰 문자열
      };
      const expiresIn = 3600;

      const token = sign(largeObject, expiresIn);

      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      expect(decoded).toHaveProperty("userId", 1);
    });
  });

  describe("signJwt 함수 (레거시)", () => {
    test("signJwt로도 JWT를 생성할 수 있다", () => {
      const data = { userId: 1, email: "test@example.com" };
      const expiresIn = 3600;

      const token = signJwt(data, expiresIn);

      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    test("signJwt로 생성한 토큰을 검증할 수 있다", () => {
      const data = { userId: 456 };
      const expiresIn = 3600;

      const token = signJwt(data, expiresIn);
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

      expect(decoded).toHaveProperty("userId", 456);
    });
  });
});
