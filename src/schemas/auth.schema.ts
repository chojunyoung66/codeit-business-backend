import { z } from "zod";

export const signInDataSchema = z.object({
  email: z.email({ message: "올바르지 않은 이메일 형식입니다." }),
  password: z
    .string({ message: "비밀번호는 문자열이어야 합니다." })
    .min(4, { message: "비밀번호는 4자 이상이어야 합니다 ." }),
});

export type SignInData = z.infer<typeof signInDataSchema>;
