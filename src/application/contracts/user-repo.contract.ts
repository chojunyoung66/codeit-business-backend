import { User } from "../../generated/prisma/client.js";

export interface IUserRepo {
  findUserByEmail: (email: string) => Promise<User | null>;
  findUserById: (id: number) => Promise<User | null>;
  findUserByRefreshToken: (refreshToken: string) => Promise<User | null>;
  findUserByGoogleId: (googleId: string) => Promise<User | null>;
  createUser: (parmas: {
    email: string;
    password: string;
    username: string;
    googleId?: string;
  }) => Promise<User>;
  linkGoogleId: (userId: number, googleId: string) => Promise<void>;
  updateRefreshToken: (
    userId: number,
    refreshToken: string | null,
  ) => Promise<void>;
}
