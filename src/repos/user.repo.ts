import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prismaClient = new PrismaClient({ adapter });

export const findUserByEmail = async (email: string) => {
  const foundUser = await prismaClient.user.findUnique({
    where: { email: email },
  });
  console.log(foundUser);
  return foundUser;
};