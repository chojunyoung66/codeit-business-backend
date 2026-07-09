export const createUserRepoMock = (initialUsers) => {
    const users = initialUsers ? [...initialUsers] : [];
    return {
        findUserById: async (id) => {
            const user = users.find((u) => u.id === id);
            if (!user)
                return null;
            return { id: user.id, email: user.email };
        },
        findUserByEmail: async (email) => users.find((u) => u.email === email) ?? null,
        createUser: async (data) => {
            const id = users.length ? users[users.length - 1].id + 1 : 1;
            const newUser = {
                id,
                email: data.email,
                password: data.password,
                username: data.username ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            users.push(newUser);
            return newUser;
        },
        updateUser: async (id, data) => {
            const idx = users.findIndex((u) => u.id === id);
            if (idx === -1)
                throw new Error("Not found");
            users[idx] = {
                ...users[idx],
                ...data,
                updatedAt: new Date(),
            };
            return users[idx];
        },
        deleteUser: async (id) => {
            const idx = users.findIndex((u) => u.id === id);
            if (idx === -1)
                throw new Error("Not found");
            const [deleted] = users.splice(idx, 1);
            return deleted;
        },
    };
};
