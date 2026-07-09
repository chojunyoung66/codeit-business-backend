import type { User } from "../../generated/prisma/client.js";

export interface UserRepo {
  findUserByEmail(email: string): Promise<User | null>;
  createUser(data: {
    email: string;
    password: string;
    username?: string;
  }): Promise<User>;
  updateUser(
    id: number,
    data: { username?: string; password?: string },
  ): Promise<User>;
  deleteUser(id: number): Promise<User>;
}
