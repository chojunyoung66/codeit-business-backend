import type { UserRepo } from "../contracts/user.repo.interface.js";
import { BusinessException } from "../../shared/business.exception.js";

export const createUserService = (userRepo: UserRepo) => {
  // 인증된 사용자의 정보를 조회
  const getMe = async (userId: number) => {
    const user = await userRepo.findUserById(userId);
    if (!user) {
      throw new BusinessException("존재하지 않는 유저입니다.");
    }
    return user;
  };

  return { getMe };
};