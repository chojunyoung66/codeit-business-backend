import { IOrderRepo } from "../contracts/order-repo.contract.js";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IPaymentClient } from "../contracts/payment-client.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

// 판매 상품은 뱃지 1종 고정이라 가격도 서버에서 고정값으로 결정한다.
const BADGE_PRICE = 10000;

export const createOrderService = (
  findUserById: IUserRepo["findUserById"],
  findPendingByUserId: IOrderRepo["findPendingByUserId"],
  create: IOrderRepo["create"],
  findById: IOrderRepo["findById"],
  markAsPaid: IOrderRepo["markAsPaid"],
  grantBadge: IUserRepo["grantBadge"],
  confirmPayment: IPaymentClient["confirm"],
) => {
  // 뱃지 주문 생성
  const createOrder = async (params: { userId: number }) => {
    // 사용자 존재 확인
    const user = await findUserById(params.userId);
    if (!user) {
      throw new BusinessException("존재하지 않는 유저입니다.");
    }

    // 이미 대기 중인 주문이 있으면 중복 생성 차단 (인증 실패가 아닌 충돌이므로 409)
    const pendingOrder = await findPendingByUserId(params.userId);
    if (pendingOrder) {
      throw new BusinessException("이미 대기 중인 주문이 있습니다.", 409);
    }

    // 클라이언트가 보낸 금액은 신뢰하지 않고 서버 고정 가격으로 생성
    const newOrder = await create({
      userId: params.userId,
      amount: BADGE_PRICE,
    });
    return newOrder;
  };

  // 결제 승인 처리
  const confirmOrder = async (params: {
    orderId: number;
    userId: number;
    paymentKey: string;
    amount: number;
  }) => {
    // 주문 존재 확인
    const order = await findById(params.orderId);
    if (!order) {
      throw new BusinessException("존재하지 않는 주문입니다.", 404);
    }

    // 소유자 확인
    if (order.userId !== params.userId) {
      throw new BusinessException("주문에 접근할 권한이 없습니다.", 403);
    }

    // 이미 처리된 주문인지 확인
    if (order.status !== "PENDING") {
      throw new BusinessException("이미 처리된 주문입니다.", 409);
    }

    // 클라이언트가 보낸 금액이 저장된 금액과 일치하는지 확인 후에만 승인 API 호출
    if (order.amount !== params.amount) {
      throw new BusinessException("결제 금액이 일치하지 않습니다.", 400);
    }

    // 토스페이먼츠 결제 승인 요청
    const payment = await confirmPayment({
      paymentKey: params.paymentKey,
      orderId: `order-${order.id}`,
      amount: order.amount,
    });
    if (payment.status !== "DONE") {
      throw new TechnicalException(
        "결제 승인에 실패했습니다.",
        TechnicalExceptionCode.PAYMENT_CONFIRM_FAILED,
      );
    }

    // 주문 완료 처리 및 뱃지 지급
    const paidOrder = await markAsPaid(order.id);
    await grantBadge(order.userId);
    return paidOrder;
  };

  return { createOrder, confirmOrder };
};

export type OrderServiceType = ReturnType<typeof createOrderService>;
