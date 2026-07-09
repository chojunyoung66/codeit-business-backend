import { prismaClient } from "../../db/prisma.js";
export const createUserRepo = () => {
    const findUserById = async (id) => {
        const foundUser = await prismaClient.user.findUnique({
            where: { id },
            select: { id: true, email: true },
        });
        return foundUser;
    };
    const findUserByEmail = async (email) => {
        const foundUser = await prismaClient.user.findUnique({
            where: { email: email },
        });
        console.log(foundUser);
        return foundUser;
    };
    const createUser = async (data) => {
        const newUser = await prismaClient.user.create({
            data,
        });
        return newUser;
    };
    const updateUser = async (id, data) => {
        const updatedUser = await prismaClient.user.update({
            where: { id },
            data,
        });
        return updatedUser;
    };
    const deleteUser = async (id) => {
        const deletedUser = await prismaClient.user.delete({
            where: { id },
        });
        return deletedUser;
    };
    return {
        findUserById,
        findUserByEmail,
        createUser,
        updateUser,
        deleteUser,
    };
};
