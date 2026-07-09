import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);
export const createUserController = (userRepo) => {
    const router = Router();
    router.get("/me", authMiddleware, asyncHandler(async (req, res) => {
        const user = await userRepo.findUserById(req.userId || 0);
        if (!user) {
            return res.status(404).json({
                message: "사용자를 찾을 수 없습니다.",
            });
        }
        return res.json({
            me: {
                userId: req.userId,
                ...user,
            },
        });
    }));
    return router;
};
