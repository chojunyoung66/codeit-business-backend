import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorMiddleware } from "./inbound/middlewares/error.middleware.js";
import { bootstrap } from "./bootstrap.js";
const { authRouter, userRouter, memoRouter } = bootstrap();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/memos", memoRouter);
app.use(errorMiddleware);
app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
});
