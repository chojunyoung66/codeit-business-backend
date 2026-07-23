export interface IGoogleUtil {
  verifyCredential: (credential: string) => Promise<{
    googleId: string;
    email: string;
    name: string;
  }>;
}
