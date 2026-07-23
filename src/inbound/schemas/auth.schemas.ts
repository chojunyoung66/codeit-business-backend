import z from "zod";

export const signInDataSchema = z.object({
  email: z.email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(4, "비밀번호는 최소 4자 이상입니다."),
});

export const signUpDataSchema = z.object({
  email: z.email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(4, "비밀번호는 최소 4자 이상입니다."),
  username: z.string().min(1, "이름은 최소 1글자 이상입니다"),
});

export const bearerTokenSchema = z.object({
  token: z.string().min(1, "토큰은 필수입니다."),
});

/** Refresh 쿠키(req.cookies) 검증용 */
export const refreshCookieSchema = z.object({
  refreshToken: z.string().min(1, "리프레시 토큰은 필수입니다."),
});

export const googleSignInBodySchema = z.object({
  credential: z.string().min(1, "Google credential은 필수입니다."),
});
