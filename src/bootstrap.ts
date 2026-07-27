import { createAuthService } from "./application/services/auth.service.js";
import { createUserService } from "./application/services/user.service.js";
import { createMemoService } from "./application/services/memo.service.js";
import { createRecommendService } from "./application/services/recommend.service.js";
import { createOrderService } from "./application/services/order.service.js";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import { createMemoController } from "./inbound/controllers/memo.controller.js";
import { createRecommendController } from "./inbound/controllers/recommend.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { createOrderController } from "./inbound/controllers/order.controller.js";
import { createAuthMiddleware } from "./inbound/middlewares/auth.middleware.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createMemoRepo } from "./outbound/repos/memo.repo.js";
import { createFakeMemoAnalyzer } from "./outbound/external/fake-memo-analyzer.js";
import { createFakeContentModerator } from "./outbound/external/fake-content-moderator.js";
import { createRecommendRepo } from "./outbound/repos/recommend.repo.js";
import { createOrderRepo } from "./outbound/repos/order.repo.js";
import { bcryptUtil } from "./shared/utils/bcrypt.util.js";
import { signJwt, jwtUtil } from "./shared/utils/jwt.util.js";
import { cryptoUtil } from "./shared/utils/crypto.util.js";
import { googleUtil } from "./shared/utils/google.util.js";

export const bootstrap = () => {
  const {
    findUserByEmail,
    createUser,
    findUserById,
    findUserByRefreshToken,
    findUserByGoogleId,
    linkGoogleId,
    updateRefreshToken,
  } = createUserRepo();
  const {
    findAll,
    create,
    findById,
    findLatestByUserId,
    update,
    delete: deleteMemoRepo,
  } = createMemoRepo();
  const { extractKeywords, recommendTopics } = createFakeMemoAnalyzer();
  const { isInappropriate } = createFakeContentModerator();
  const {
    findByUserIdAndArticleId,
    create: createRecommend,
    delete: deleteRecommendRepo,
  } = createRecommendRepo();
  const { create: createOrderRepoRecord, findPendingByUserId } =
    createOrderRepo();

  const { signIn, signUp, refresh, signOut, googleSignIn } = createAuthService(
    findUserByEmail,
    createUser,
    signJwt,
    bcryptUtil,
    updateRefreshToken,
    findUserByRefreshToken,
    jwtUtil.verifyJwt,
    cryptoUtil,
    findUserByGoogleId,
    googleUtil.verifyCredential,
    linkGoogleId,
  );
  const { getMe } = createUserService(findUserById);
  const { getAllMemos, createMemo, updateMemo, deleteMemo, analyzeMemos } =
    createMemoService(
      findAll,
      create,
      findUserById,
      findById,
      update,
      deleteMemoRepo,
      findLatestByUserId,
      extractKeywords,
      recommendTopics,
      isInappropriate,
    );
  const { toggleRecommend } = createRecommendService(
    findById,
    findByUserIdAndArticleId,
    createRecommend,
    deleteRecommendRepo,
  );
  const { createOrder } = createOrderService(
    findUserById,
    findPendingByUserId,
    createOrderRepoRecord,
  );

  const authMiddleware = createAuthMiddleware(jwtUtil.verifyJwt);
  const { router: authRouter } = createAuthController(
    signIn,
    signUp,
    signOut,
    refresh,
    authMiddleware,
    googleSignIn,
  );
  const { router: userRouter } = createUserController(
    getMe,
    analyzeMemos,
    authMiddleware,
  );
  const { router: memoRouter } = createMemoController(
    getAllMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    analyzeMemos,
    authMiddleware,
  );
  const { router: recommendRouter } = createRecommendController(
    toggleRecommend,
    authMiddleware,
  );
  const { router: orderRouter } = createOrderController(
    createOrder,
    authMiddleware,
  );

  return {
    authRouter,
    userRouter,
    memoRouter,
    recommendRouter,
    orderRouter,
  };
};
