import { createAuthService } from "./application/services/auth.service.js";
import { createUserService } from "./application/services/user.service.js";
import { createMemoService } from "./application/services/memo.service.js";
import { createRecommendService } from "./application/services/recommend.service.js";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import { createMemoController } from "./inbound/controllers/memo.controller.js";
import { createRecommendController } from "./inbound/controllers/recommend.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { createAuthMiddleware } from "./inbound/middlewares/auth.middleware.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createMemoRepo } from "./outbound/repos/memo.repo.js";
import { createRecommendRepo } from "./outbound/repos/recommend.repo.js";
import { bcryptUtil } from "./shared/utils/bcrypt.util.js";
import { signJwt, jwtUtil } from "./shared/utils/jwt.util.js";

export const bootstrap = () => {
  const { findUserByEmail, createUser, findUserById } = createUserRepo();
  const {
    findAll,
    create,
    findById,
    update,
    delete: deleteMemoRepo,
  } = createMemoRepo();
  const {
    findByUserIdAndArticleId,
    create: createRecommend,
    delete: deleteRecommendRepo,
  } = createRecommendRepo();

  const { signIn, signUp } = createAuthService(
    findUserByEmail,
    createUser,
    signJwt,
    bcryptUtil,
  );
  const { getMe } = createUserService(findUserById);
  const { getAllMemos, createMemo, updateMemo, deleteMemo } = createMemoService(
    findAll,
    create,
    findUserById,
    findById,
    update,
    deleteMemoRepo,
  );
  const { toggleRecommend } = createRecommendService(
    findById,
    findByUserIdAndArticleId,
    createRecommend,
    deleteRecommendRepo,
  );

  const authMiddleware = createAuthMiddleware(jwtUtil.verifyJwt);
  const { router: authRouter } = createAuthController(signIn, signUp);
  const { router: userRouter } = createUserController(getMe, authMiddleware);
  const { router: memoRouter } = createMemoController(
    getAllMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    authMiddleware,
  );
  const { router: recommendRouter } = createRecommendController(
    toggleRecommend,
    authMiddleware,
  );

  return { authRouter, userRouter, memoRouter, recommendRouter };
};