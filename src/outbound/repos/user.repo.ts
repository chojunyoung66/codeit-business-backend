import { prismaClient } from "../../db/prisma.js";
import type { UserRepo } from "../../application/contracts/user.repo.interface.js";

export const createUserRepo = (): UserRepo => {
  const findUserByEmail = async (email: string) => {
    const foundUser = await prismaClient.user.findUnique({
      where: { email: email },
    });
    console.log(foundUser);
    return foundUser;
  };

  const createUser = async (data: {
    email: string;
    password: string;
    username?: string;
  }) => {
    const newUser = await prismaClient.user.create({
      data,
    });
    return newUser;
  };

  const updateUser = async (
    id: number,
    data: { username?: string; password?: string },
  ) => {
    const updatedUser = await prismaClient.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  };

  const deleteUser = async (id: number) => {
    const deletedUser = await prismaClient.user.delete({
      where: { id },
    });
    return deletedUser;
  };

  return {
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser,
  };
};
