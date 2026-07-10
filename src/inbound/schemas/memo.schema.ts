import { z } from "zod";

export const createMemoSchema = z.object({
  userId: z.coerce.number({ message: "사용자 ID는 숫자여야 합니다." }),
  title: z
    .string({ message: "제목은 문자열이어야 합니다." })
    .min(1, { message: "제목은 비워둘 수 없습니다." }),
  content: z
    .string({ message: "내용은 문자열이어야 합니다." })
    .min(1, { message: "내용은 비워둘 수 없습니다." }),
});

export const updateMemoSchema = z.object({
  title: z
    .string({ message: "제목은 문자열이어야 합니다." })
    .min(1, { message: "제목은 비워둘 수 없습니다." })
    .optional(),
  content: z
    .string({ message: "내용은 문자열이어야 합니다." })
    .min(1, { message: "내용은 비워둘 수 없습니다." })
    .optional(),
});

export type CreateMemoData = z.infer<typeof createMemoSchema>;
export type UpdateMemoData = z.infer<typeof updateMemoSchema>;
