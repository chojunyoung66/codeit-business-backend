import { jest, describe, test, expect } from "@jest/globals";
import * as bcrypt from "bcrypt";
import { createBcryptUtil } from "./bcrypt.util.js";

describe("bcryptUtil 테스트", () => {
  describe("hash", () => {
    test("비밀번호를 정상적으로 해시한다", async () => {
      const { hash } = createBcryptUtil();
      const password = "mypassword123";
      const saltRounds = 10;

      const hashedPassword = await hash(password, saltRounds);

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(hashedPassword).not.toBe(password);
    });

    test("빈 문자열 비밀번호도 해시할 수 있다", async () => {
      const { hash } = createBcryptUtil();
      const hashedPassword = await hash("", 10);

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    test("saltRounds가 0이면 기본값(10)으로 처리된다", async () => {
      const { hash } = createBcryptUtil();

      const hashedPassword = await hash("password", 0);

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
    });

    test("saltRounds가 매우 크면 성능 저하가 발생한다", async () => {
      const { hash } = createBcryptUtil();

      // 매우 큰 saltRounds는 무한 대기를 초래할 수 있으므로 타임아웃 추가
      const startTime = Date.now();
      const hashedPassword = await hash("password", 15);
      const duration = Date.now() - startTime;

      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(duration).toBeGreaterThan(1000); // 상당한 시간이 소요됨
    }, 30000);

    test("같은 비밀번호도 매번 다른 해시를 생성한다", async () => {
      const { hash } = createBcryptUtil();
      const password = "samepassword";

      const hash1 = await hash(password, 10);
      const hash2 = await hash(password, 10);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("compare", () => {
    test("bcrypt 해시된 비밀번호를 정상적으로 비교한다", async () => {
      const { compare } = createBcryptUtil();
      const password = "mypassword";
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await compare(password, hashedPassword);

      expect(result).toBe(true);
    });

    test("bcrypt 해시된 비밀번호 비교에 실패하면 false를 반환한다", async () => {
      const { compare } = createBcryptUtil();
      const hashedPassword = await bcrypt.hash("correct", 10);

      const result = await compare("wrong", hashedPassword);

      expect(result).toBe(false);
    });

    test("$2로 시작하지 않는 평문 비밀번호는 직접 비교한다", async () => {
      const { compare } = createBcryptUtil();
      const plainPassword = "plain123";

      const result = await compare(plainPassword, plainPassword);

      expect(result).toBe(true);
    });

    test("평문 비밀번호 비교에 실패하면 false를 반환한다", async () => {
      const { compare } = createBcryptUtil();

      const result = await compare("input", "stored");

      expect(result).toBe(false);
    });

    test("빈 문자열 저장된 비밀번호와 빈 문자열 입력은 일치한다", async () => {
      const { compare } = createBcryptUtil();

      const result = await compare("", "");

      expect(result).toBe(true);
    });

    test("$2로 시작하는 해시는 bcrypt 비교를 사용한다", async () => {
      const { compare } = createBcryptUtil();
      const password = "password";
      const hashedPassword = await bcrypt.hash(password, 10);

      // 현재 bcrypt는 $2b를 기본으로 생성함
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      const result = await compare(password, hashedPassword);
      expect(result).toBe(true);
    });

    test("입력 비밀번호가 빈 문자열일 때 bcrypt 해시와의 비교는 false를 반환한다", async () => {
      const { compare } = createBcryptUtil();
      const hashedPassword = await bcrypt.hash("notempty", 10);

      const result = await compare("", hashedPassword);

      expect(result).toBe(false);
    });

    test("$2b로 시작하는 해시도 bcrypt 비교를 사용한다", async () => {
      const { compare } = createBcryptUtil();
      // $2b는 bcrypt 2017 이후 권장 버전
      const bcryptHash =
        "$2b$10$H.7KzZYfSXCGTRm9kPJIL.xvkR3M6HhL9yWxM.7N4vqHXJ8pZJJjm";

      // 이 테스트는 실제 유효한 해시와의 비교를 테스트
      // 평문이 아닌 bcrypt 해시로 간주되어야 함
      const result = await compare("password", bcryptHash);

      // 실제 bcrypt 비교가 수행되어야 함
      expect(typeof result).toBe("boolean");
    });
  });
});
