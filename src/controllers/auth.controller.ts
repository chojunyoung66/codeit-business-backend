import { Router, Request, Response } from "express";
import { signInService } from "../services/auth.service.js";

const router = Router();

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // zod로 대체
  if (typeof email !== "string") {
    return res
      .status(401)
      .json({ message: "올바르지 않은 이메일 형식입니다." });
  }

  // 서비스 호출
  const token = await signInService({ email, password });

  // 응답 전송
  return res.json({ token });
});
router.post("/signout", (req: Request, res: Response) => {
  return res.json({});
});

export default router;