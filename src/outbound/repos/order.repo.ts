import { IOrderRepo } from "../../application/contracts/order-repo.contract.js";
import { prismaClient } from "./prismaClient.js";

export const createOrderRepo = (): IOrderRepo => {
  const create: IOrderRepo["create"] = async (params) => {
    const newOrder = await prismaClient.order.create({
      data: {
        userId: params.userId,
        amount: params.amount,
      },
    });
    return newOrder;
  };

  const findPendingByUserId: IOrderRepo["findPendingByUserId"] = async (
    userId,
  ) => {
    const pendingOrder = await prismaClient.order.findFirst({
      where: { userId, status: "PENDING" },
    });
    return pendingOrder;
  };

  const findById: IOrderRepo["findById"] = async (id) => {
    const order = await prismaClient.order.findUnique({
      where: { id },
    });
    return order;
  };

  const markAsPaid: IOrderRepo["markAsPaid"] = async (id) => {
    const paidOrder = await prismaClient.order.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });
    return paidOrder;
  };

  return { create, findPendingByUserId, findById, markAsPaid };
};
