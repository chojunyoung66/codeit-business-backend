import { Order } from "../../generated/prisma/client.js";

export interface IOrderRepo {
  create: (params: { userId: number; amount: number }) => Promise<Order>;
  findPendingByUserId: (userId: number) => Promise<Order | null>;
  findById: (id: number) => Promise<Order | null>;
  markAsPaid: (id: number) => Promise<Order>;
}
