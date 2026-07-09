import { createAuthService } from "./application/services/auth.service.js";
import { createUserService } from "./application/services/user.service.js";
import { createArticleService } from "./application/services/article.service.js";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import { createArticleController } from "./inbound/controllers/article.controller.js";
import memoController from "./inbound/controllers/memo.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { authMiddleware } from "./inbound/middlewares/auth.middlewares.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createArticleRepo } from "./outbound/repos/article.repo.js";
import { createBcryptUtil } from "./utils/bcrypt.util.js";
import { createJwtUtil } from "./utils/jwt.util.js";
import { createContentPolicy } from "./domain/content-policy/content.policy.js";

export const bootstrap = () => {
  // 유틸 인스턴스 생성
  const userRepo = createUserRepo();
  const articleRepo = createArticleRepo();
  const bcryptUtil = createBcryptUtil();
  const jwtUtil = createJwtUtil();
  const contentPolicy = createContentPolicy();

  // 서비스 생성
  const authService = createAuthService(userRepo, jwtUtil, bcryptUtil);
  const userService = createUserService(userRepo);
  const articleService = createArticleService(articleRepo, userRepo, contentPolicy);

  // 컨트롤러 생성
  const authRouter = createAuthController(authService);
  const userRouter = createUserController(userRepo);
  const articleRouter = createArticleController(articleService);
  const memoRouter = memoController;

  return { authRouter, userRouter, articleRouter, memoRouter };
};
