import { Router, Request, Response, NextFunction } from "express";
import { OrderServiceType } from "../../application/services/order.service.js";
import { AuthMiddlewareType } from "../middlewares/auth.middleware.js";

export const createOrderController = (
  createOrder: OrderServiceType["createOrder"],
  authMiddleware: AuthMiddlewareType,
) => {
  const router = Router();

  router.post(
    "/",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      const order = await createOrder({ userId: req.userId! });
      res.json({ order });
    },
  );

  return { router };
};
