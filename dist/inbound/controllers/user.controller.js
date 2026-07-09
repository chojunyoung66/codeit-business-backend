import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
export const createUserController = (userRepo) => {
    const router = Router();
    router.get("/me", authMiddleware, async (req, res) => {
        const user = await userRepo.findUserById(req.userId || 0);
        res.json({
            me: {
                userId: req.userId,
                ...user,
            },
        });
    });
    return router;
};
export default createUserController(null);
