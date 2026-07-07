import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import authController from "./controllers/auth.controller.js";
import memoController from "./controllers/memo.controller.js";
import userController from "./controllers/user.controller.js";

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});