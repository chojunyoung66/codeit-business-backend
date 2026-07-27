import { IOrderRepo } from "../contracts/order-repo.contract.js";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";

// 판매 상품은 뱃지 1종 고정이라 가격도 서버에서 고정값으로 결정한다.
const BADGE_PRICE = 10000;

export const createOrderService = (
  findUserById: IUserRepo["findUserById"],
  findPendingByUserId: IOrderRepo["findPendingByUserId"],
  create: IOrderRepo["create"],
) => {
  // 뱃지 주문 생성
  const createOrder = async (params: { userId: number }) => {
    // 사용자 존재 확인
    const user = await findUserById(params.userId);
    if (!user) {
      throw new BusinessException("존재하지 않는 유저입니다.");
    }

    // 이미 대기 중인 주문이 있으면 중복 생성 차단
    const pendingOrder = await findPendingByUserId(params.userId);
    if (pendingOrder) {
      throw new BusinessException("이미 대기 중인 주문이 있습니다.");
    }

    // 클라이언트가 보낸 금액은 신뢰하지 않고 서버 고정 가격으로 생성
    const newOrder = await create({
      userId: params.userId,
      amount: BADGE_PRICE,
    });
    return newOrder;
  };

  return { createOrder };
};

export type OrderServiceType = ReturnType<typeof createOrderService>;
