import { IUserRepo } from "../../application/contracts/user-repo.contract.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";
import { prismaClient } from "./prismaClient.js";

export const createUserRepo = (): IUserRepo => {
  // 이메일로 사용자 조회
  const findUserByEmail: IUserRepo["findUserByEmail"] = async (
    email: string,
  ) => {
    const foundUser = await prismaClient.user.findUnique({
      where: { email },
    });
    return foundUser;
  };

  // ID로 사용자 조회
  const findUserById: IUserRepo["findUserById"] = async (id: number) => {
    const foundUser = await prismaClient.user.findUnique({
      where: { id },
    });
    return foundUser;
  };

  // Google ID로 사용자 조회
  const findUserByGoogleId: IUserRepo["findUserByGoogleId"] = async (
    googleId: string,
  ) => {
    return prismaClient.user.findUnique({ where: { googleId } });
  };

  // 리프레시 토큰으로 사용자 조회
  const findUserByRefreshToken: IUserRepo["findUserByRefreshToken"] = async (
    refreshToken: string,
  ) => {
    const foundUser = await prismaClient.user.findUnique({
      where: { refreshToken },
    });
    return foundUser;
  };

  // 사용자 생성
  const createUser: IUserRepo["createUser"] = async (params) => {
    try {
      const newUser = await prismaClient.user.create({
        data: {
          email: params.email,
          password: params.password,
          username: params.username,
          googleId: params.googleId,
        },
      });

      return newUser;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new TechnicalException(
            err.message,
            TechnicalExceptionCode.EMAIL_DUPLICATED,
          );
        }
      }

      throw err;
    }
  };

  // 기존 계정에 Google ID 연결
  const linkGoogleId: IUserRepo["linkGoogleId"] = async (userId, googleId) => {
    await prismaClient.user.update({
      where: { id: userId },
      data: { googleId },
    });
  };

  // 리프레시 토큰 저장 또는 폐기
  const updateRefreshToken: IUserRepo["updateRefreshToken"] = async (
    userId,
    refreshToken,
  ) => {
    await prismaClient.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  };

  // 뱃지 지급 (지급 시각 기록)
  const grantBadge: IUserRepo["grantBadge"] = async (userId) => {
    await prismaClient.user.update({
      where: { id: userId },
      data: { badgeGrantedAt: new Date() },
    });
  };

  return {
    findUserByEmail,
    findUserById,
    findUserByRefreshToken,
    findUserByGoogleId,
    linkGoogleId,
    createUser,
    updateRefreshToken,
    grantBadge,
  };
};
