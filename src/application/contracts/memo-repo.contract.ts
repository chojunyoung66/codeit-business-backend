import { Article } from "../../generated/prisma/client.js";

export interface IMemoRepo {
  findAll: (userId: number) => Promise<any[]>;
  create: (params: {
    userId: number;
    title: string;
    content: string;
  }) => Promise<Article>;
  findById: (id: number) => Promise<Article | null>;
  update: (params: {
    id: number;
    title?: string;
    content?: string;
  }) => Promise<Article>;
  delete: (id: number) => Promise<Article>;
  findLatestByUserId: (userId: number, limit: number) => Promise<Article[]>;
}
