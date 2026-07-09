import type { User } from "../../../generated/prisma/client.js";
import type { UserRepo } from "../user.repo.interface.js";

export const createUserRepoMock = (initialUsers?: User[]): UserRepo => {
  const users: User[] = initialUsers ? [...initialUsers] : [];

  return {
    findUserById: async (id: number) => {
      const user = users.find((u) => (u.id as number) === id);
      if (!user) return null;
      return { id: user.id as number, email: user.email };
    },
    findUserByEmail: async (email: string) =>
      users.find((u) => u.email === email) ?? null,
    createUser: async (data) => {
      const id = users.length ? (users[users.length - 1].id as number) + 1 : 1;
      const newUser = {
        id,
        email: data.email,
        password: data.password,
        username: data.username ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;
      users.push(newUser);
      return newUser;
    },
    updateUser: async (id, data) => {
      const idx = users.findIndex((u) => (u.id as number) === id);
      if (idx === -1) throw new Error("Not found");
      users[idx] = {
        ...(users[idx] as any),
        ...data,
        updatedAt: new Date(),
      } as User;
      return users[idx];
    },
    deleteUser: async (id) => {
      const idx = users.findIndex((u) => (u.id as number) === id);
      if (idx === -1) throw new Error("Not found");
      const [deleted] = users.splice(idx, 1);
      return deleted;
    },
  };
};
