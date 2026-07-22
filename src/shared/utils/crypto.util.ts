import { createHash } from "crypto";
import type { ICryptoUtil } from "../contracts/crypto-util.contract.js";

export const cryptoUtil: ICryptoUtil = {
  // SHA-256은 결정적이라 DB 조회 시 동일 토큰 → 동일 해시 보장
  hash: (token: string) => createHash("sha256").update(token).digest("hex"),
};
