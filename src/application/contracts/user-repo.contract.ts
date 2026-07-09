export interface IUserRepo {
  findUserById(id: number): Promise<{ id: number; email: string } | null>;
}
