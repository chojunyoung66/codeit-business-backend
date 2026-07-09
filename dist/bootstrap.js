import { createAuthService } from "./application/services/auth.service.js";
import { createUserService } from "./application/services/user.service.js";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import memoController from "./inbound/controllers/memo.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createBcryptUtil } from "./utils/bcrypt.util.js";
import { createJwtUtil } from "./utils/jwt.util.js";
export const bootstrap = () => {
    // 유틸 인스턴스 생성
    const userRepo = createUserRepo();
    const bcryptUtil = createBcryptUtil();
    const jwtUtil = createJwtUtil();
    // 서비스 생성
    const authService = createAuthService(userRepo, jwtUtil, bcryptUtil);
    const userService = createUserService(userRepo);
    // 컨트롤러 생성
    const authRouter = createAuthController(authService);
    const userRouter = createUserController(userRepo);
    const memoRouter = memoController;
    return { authRouter, userRouter, memoRouter };
};
