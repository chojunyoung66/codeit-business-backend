import { Router, Request, Response } from "express";
import { createAuthService } from "../services/auth.service.js";
import { createUserRepo } from "../repos/user.repo.js";
import { signJwt } from "../utils/jwt.util.js";
import { signInDataSchema } from "../schemas/auth.schema.js";
import { prismaClient } from "../db/prisma.js";

const router = Router();

const userRepo = createUserRepo(prismaClient);
const { signInService } = createAuthService(userRepo, signJwt);

router.post("/signin", async (req: Request, res: Response) => {
  const parsedBody = signInDataSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  // 서비스 호출
  const token = await signInService(parsedBody.data);

  // 응답 전송
  return res.json({ token });
});
router.post("/signout", (req: Request, res: Response) => {
  return res.json({});
});

export default router;