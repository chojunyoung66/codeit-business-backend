import { createAuthService } from "./application/services/auth.service.js";
import { createUserService } from "./application/services/user.service.js";
import { createMemoService } from "./application/services/memo.service.js";
import { createAuthController } from "./inbound/controllers/auth.controller.js";
import { createMemoController } from "./inbound/controllers/memo.controller.js";
import { createUserController } from "./inbound/controllers/user.controller.js";
import { createAuthMiddleware } from "./inbound/middlewares/auth.middleware.js";
import { createUserRepo } from "./outbound/repos/user.repo.js";
import { createMemoRepo } from "./outbound/repos/memo.repo.js";
import { bcryptUtil } from "./shared/utils/bcrypt.util.js";
import { signJwt, jwtUtil } from "./shared/utils/jwt.util.js";

export const bootstrap = () => {
  const { findUserByEmail, createUser, findUserById } = createUserRepo();
  const { findByUserId, create, findById, update, delete: delete_ } = createMemoRepo();

  const { signIn, signUp } = createAuthService(
    findUserByEmail,
    createUser,
    signJwt,
    bcryptUtil,
  );
  const { getMe } = createUserService(findUserById);
  const { getMyMemos, createMemo, updateMemo, deleteMemo } = createMemoService(
    findByUserId,
    create,
    findUserById,
    findById,
    update,
    delete_,
  );

  const authMiddleware = createAuthMiddleware(jwtUtil.verifyJwt);
  const { router: authRouter } = createAuthController(signIn, signUp);
  const { router: userRouter } = createUserController(getMe, authMiddleware);
  const { router: memoRouter } = createMemoController(
    getMyMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    authMiddleware,
  );

  return { authRouter, userRouter, memoRouter };
};
