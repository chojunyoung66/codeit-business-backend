export interface BcryptUtil {
  hash(password: string, saltRounds: number): Promise<string>;
  compare(inputPassword: string, storedPassword: string): Promise<boolean>;
}
