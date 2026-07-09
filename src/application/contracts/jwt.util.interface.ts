export interface JwtUtil {
  sign(data: string | Buffer | object, expiresIn: number): string;
  verify(token: string): { userId: number };
}
