import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
const router = Router();
router.get("/me", authMiddleware, (req, res) => {
  return res.json({
    me: {
      userId: req.userId,
      username: "Harry Potter",
    },
  });
});
export default router;
