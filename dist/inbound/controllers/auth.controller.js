import { Router } from "express";
import { signInDataSchema, signUpDataSchema } from "../schemas/auth.schema.js";
import { BusinessException } from "../../shared/business.exception.js";
export const createAuthController = (authService) => {
    const { signInService, signUpService } = authService;
    const router = Router();
    router.post("/signin", async (req, res) => {
        const parsedBody = signInDataSchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new BusinessException("요청 값이 올바르지 않습니다.");
        }
        const token = await signInService(parsedBody.data);
        return res.json({ token });
    });
    router.post("/signup", async (req, res) => {
        const parsedBody = signUpDataSchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw new BusinessException("요청 값이 올바르지 않습니다.");
        }
        const token = await signUpService(parsedBody.data);
        return res.status(201).json({ token });
    });
    router.post("/signout", (_req, res) => {
        return res.json({});
    });
    return router;
};
