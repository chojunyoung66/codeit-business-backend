import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import memoController from "./inbound/controllers/memo.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { createAuthService } from "./application/services/auth.service.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createJwtUtil } from "./utils/jwt.util.js";
import { createBcryptUtil } from "./utils/bcrypt.util.js";
import { BusinessException } from "./shared/business.exception.js";
import { TechnicalException } from "./shared/technical.exception.js";
// 의존성 생성 (DI Container 역할)
const userRepo = createUserRepo();
const jwtUtil = createJwtUtil();
const bcryptUtil = createBcryptUtil();
const authService = createAuthService(userRepo, jwtUtil, bcryptUtil);
// 컨트롤러 생성
const authController = createAuthController(authService);
const userController = createUserController(userRepo);
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("combined")); // 요청 로그를 콘솔에 출력-- development 환경에서는 "dev"로 변경 가능
app.use("/api/auth", authController);
app.use("/api/users", userController);
app.use("/api/memos", memoController);
app.use((err, req, res, next) => {
    if (err) {
        if (err instanceof BusinessException) {
            // 고객에게는 정직하게 문제 상황을 알려드리자.
            // 개발자에게는 안보낸다.
            res.status(401).json({ message: err.message });
        }
        else if (err instanceof TechnicalException) {
            // 고객에게는 대충 알려드리고
            // 개발자에게는 긴급 요청 보낸다: 오픈소스: sentry => 사내 슬랙으로 에러가 띠릭
            res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
        }
        else {
            // 개발자가 미처 생각하지 못한 깜놀 에러
            res.status(500).json({ message: "알 수 없는 에러가 발생했어요" });
            // 개발자에게는 긴급 요청 보낸다.
        }
    }
});
app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
});
