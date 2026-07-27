import { describe, it, expect, jest } from "@jest/globals";
import { createOrderService } from "./order.service.js";
import { IOrderRepo } from "../contracts/order-repo.contract.js";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";

describe("OrderService", () => {
  describe("createOrder", () => {
    it("사용자 존재를 확인한 뒤 고정 가격(10,000원)으로 주문을 생성한다", async () => {
      // 사용자 존재
      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1 } as any);

      // 대기 중인 주문 없음
      const mockFindPendingByUserId = jest
        .fn<IOrderRepo["findPendingByUserId"]>()
        .mockResolvedValue(null);

      // 생성된 주문
      const newOrder = {
        id: 1,
        userId: 1,
        amount: 10000,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        paidAt: null,
      };
      const mockCreate = jest
        .fn<IOrderRepo["create"]>()
        .mockResolvedValue(newOrder as any);

      // OrderService 생성
      const orderService = createOrderService(
        mockFindUserById,
        mockFindPendingByUserId,
        mockCreate,
      );

      // createOrder 호출
      const result = await orderService.createOrder({ userId: 1 });

      // 검증: 고정 가격으로 생성, 클라이언트 입력값 미사용
      expect(result).toEqual(newOrder);
      expect(mockFindUserById).toHaveBeenCalledWith(1);
      expect(mockCreate).toHaveBeenCalledWith({ userId: 1, amount: 10000 });
    });

    it("존재하지 않는 유저면 BusinessException을 던진다", async () => {
      // 사용자 없음
      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue(null);
      const mockFindPendingByUserId =
        jest.fn<IOrderRepo["findPendingByUserId"]>();
      const mockCreate = jest.fn<IOrderRepo["create"]>();

      const orderService = createOrderService(
        mockFindUserById,
        mockFindPendingByUserId,
        mockCreate,
      );

      // 검증: 유저 확인 단계에서 즉시 중단
      await expect(orderService.createOrder({ userId: 999 })).rejects.toThrow(
        new BusinessException("존재하지 않는 유저입니다."),
      );
      expect(mockFindPendingByUserId).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("이미 대기 중인 주문이 있으면 BusinessException을 던진다", async () => {
      // 사용자 존재
      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1 } as any);

      // 이미 대기 중인 주문 존재
      const existingPendingOrder = {
        id: 1,
        userId: 1,
        amount: 10000,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        paidAt: null,
      };
      const mockFindPendingByUserId = jest
        .fn<IOrderRepo["findPendingByUserId"]>()
        .mockResolvedValue(existingPendingOrder as any);

      const mockCreate = jest.fn<IOrderRepo["create"]>();

      const orderService = createOrderService(
        mockFindUserById,
        mockFindPendingByUserId,
        mockCreate,
      );

      // 검증: 중복 주문 생성 차단
      await expect(orderService.createOrder({ userId: 1 })).rejects.toThrow(
        new BusinessException("이미 대기 중인 주문이 있습니다."),
      );
      expect(mockFindPendingByUserId).toHaveBeenCalledWith(1);
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });
});
