import { z } from "zod";
export const signInDataSchema = z.object({
  email: z.email({ message: "올바르지 않은 이메일 형식입니다." }),
  password: z
    .string({ message: "비밀번호는 문자열이어야 합니다." })
    .min(4, { message: "비밀번호는 4자 이상이어야 합니다 ." }),
});
export const signUpDataSchema = signInDataSchema.extend({
  username: z
    .string({ message: "사용자 이름은 문자열이어야 합니다." })
    .min(1, { message: "사용자 이름은 비워둘 수 없습니다." })
    .optional(),
});
