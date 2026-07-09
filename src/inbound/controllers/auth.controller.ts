import { Router, Request, Response } from "express";
import { createAuthService } from "../../application/services/auth.service.js";
import { createUserRepo } from "../../outbound/repos/user.repo.js";
import { createJwtUtil } from "../../utils/jwt.util.js";
import { createBcryptUtil } from "../../utils/bcrypt.util.js";
import { signInDataSchema, signUpDataSchema } from "../schemas/auth.schema.js";
import { AuthServiceError } from "../../application/contracts/auth.service.interface.js";

const router = Router();

const userRepo = createUserRepo();
const jwtUtil = createJwtUtil();
const bcryptUtil = createBcryptUtil();
const { signInService, signUpService } = createAuthService(
  userRepo,
  jwtUtil,
  bcryptUtil,
);

router.post("/signin", async (req: Request, res: Response) => {
  const parsedBody = signInDataSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    // 서비스 호출
    const token = await signInService(parsedBody.data);
    return res.json({ token });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(401).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.post("/signup", async (req: Request, res: Response) => {
  const parsedBody = signUpDataSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      message: "요청 값이 올바르지 않습니다.",
      errors: parsedBody.error.issues,
    });
  }

  try {
    const token = await signUpService(parsedBody.data);
    return res.status(201).json({ token });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const statusCode = error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
      return res.status(statusCode).json({
        message: error.message,
        code: error.code,
      });
    }
    throw error;
  }
});

router.post("/signout", (req: Request, res: Response) => {
  return res.json({});
});

export default router;
