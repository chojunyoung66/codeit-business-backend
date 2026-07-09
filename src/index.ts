import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorMiddleware, notFoundMiddleware } from "./inbound/middlewares/error.middleware.js";
import { bootstrap } from "./bootstrap.js";
import helmet from "helmet";
import rateLimiter from "express-rate-limit";

const { authRouter, userRouter, memoRouter } = bootstrap();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers 
    message: "Too many requests from this IP, please try again later."
  }),
);  
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/memos", memoRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});