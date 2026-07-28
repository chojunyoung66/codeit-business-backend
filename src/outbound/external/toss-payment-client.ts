import { IPaymentClient } from "../../application/contracts/payment-client.contract.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

export const createTossPaymentClient = (): IPaymentClient => {
  const confirm: IPaymentClient["confirm"] = async (params) => {
    // 시크릿 키 뒤에 콜론을 붙여 base64 인코딩 (토스페이먼츠 인증 방식)
    const secretKey = process.env.TOSS_SECRET_KEY ?? "";
    const authHeader = `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;

    const response = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new TechnicalException(
        "토스페이먼츠 결제 승인에 실패했습니다.",
        TechnicalExceptionCode.PAYMENT_CONFIRM_FAILED,
        errorBody,
      );
    }

    const payment = (await response.json()) as { status: string };
    return { status: payment.status };
  };

  return { confirm };
};
