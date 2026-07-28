import { z } from "zod";

export const confirmOrderDataSchema = z.object({
  paymentKey: z.string().min(1, "paymentKey는 필수입니다."),
  amount: z
    .number()
    .int("금액은 정수여야 합니다.")
    .positive("금액은 양수여야 합니다."),
});
