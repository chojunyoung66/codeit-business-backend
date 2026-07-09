import { describe, it, expect, jest } from "@jest/globals";
import { createUserService } from "./user.service.js";
import { BusinessException } from "../../shared/business.exception.js";
describe("UserService - getMe", () => {
    it("사용자 ID로 사용자 정보를 조회한다", async () => {
        // 테스트용 Mock User 데이터
        const mockUser = {
            id: 1,
            email: "test@example.com",
        };
        // Mock findUserById
        const mockFindUserById = jest
            .fn()
            .mockResolvedValue(mockUser);
        // Mock UserRepo
        const mockUserRepo = {
            findUserById: mockFindUserById,
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        };
        // UserService 생성
        const userService = createUserService(mockUserRepo);
        // getMe 호출
        const result = await userService.getMe(1);
        // 검증
        expect(result).toEqual(mockUser);
        expect(mockFindUserById).toHaveBeenCalledWith(1);
    });
    it("사용자를 찾을 수 없으면 BusinessException을 던진다", async () => {
        // Mock findUserById - null 반환
        const mockFindUserById = jest
            .fn()
            .mockResolvedValue(null);
        // Mock UserRepo
        const mockUserRepo = {
            findUserById: mockFindUserById,
            findUserByEmail: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
        };
        // UserService 생성
        const userService = createUserService(mockUserRepo);
        // getMe 호출 시 예외 발생 검증
        await expect(userService.getMe(999)).rejects.toThrow(new BusinessException("존재하지 않는 유저입니다."));
        expect(mockFindUserById).toHaveBeenCalledWith(999);
    });
});
