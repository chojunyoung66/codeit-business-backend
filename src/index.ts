import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authController from "./controllers/auth.controller.js";
import memoController from "./controllers/memo.controller.js";
import userController from "./controllers/user.controller.js";
import { prismaClient } from "./db/prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/memos", memoController);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
  }
});

const server = app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});

// 우아한 종료 처리
const gracefulShutdown = async () => {
  console.log("서버 종료 시작...");
  server.close(async () => {
    console.log("HTTP 서버 종료됨");
    await prismaClient.$disconnect();
    console.log("Prisma 연결 종료됨");
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);