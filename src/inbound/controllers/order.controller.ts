import { Router, Request, Response, NextFunction } from "express";
import { OrderServiceType } from "../../application/services/order.service.js";
import { AuthMiddlewareType } from "../middlewares/auth.middleware.js";
import { confirmOrderDataSchema } from "../schemas/order.schemas.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import z from "zod";

export const createOrderController = (
  createOrder: OrderServiceType["createOrder"],
  confirmOrder: OrderServiceType["confirmOrder"],
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

  router.post(
    "/:id/confirm",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
      const result = confirmOrderDataSchema.safeParse(req.body);
      if (!result.success) {
        throw new BusinessException(z.prettifyError(result.error));
      }

      const order = await confirmOrder({
        orderId: parseInt(String(req.params.id)),
        userId: req.userId!,
        paymentKey: result.data.paymentKey,
        amount: result.data.amount,
      });

      res.json({ order });
    },
  );

  return { router };
};
