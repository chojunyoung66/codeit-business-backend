import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./inbound/middlewares/error.middleware.js";
import { bootstrap } from "./bootstrap.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const { authRouter, userRouter, memoRouter, recommendRouter, orderRouter } =
  bootstrap();

const app = express();

// credentials:true 일 때 origin은 반드시 구체 주소여야 함 (* 불가)
const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // same-origin / 서버 도구(curl)처럼 Origin 없는 요청은 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
// Cookie 헤더를 파싱해 req.cookies에 넣는다 (signedCookies 미사용)
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: "너무 많은 요청이 발생했습니다. 잠시 뒤에 다시 시도해주세요.",
  }),
);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/memos", memoRouter);
app.use("/api/recommends", recommendRouter);
app.use("/api/orders", orderRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`서버 포트: ${process.env.PORT}`);
});
