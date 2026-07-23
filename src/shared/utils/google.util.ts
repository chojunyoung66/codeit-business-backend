import { IGoogleUtil } from "../contracts/google-util.contract.js";
import { BusinessException } from "../exceptions/business.exception.js";

export const googleUtil: IGoogleUtil = {
  verifyCredential: async (credential) => {
    // Google tokeninfo 엔드포인트로 credential 검증
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`,
    );

    if (!res.ok) {
      throw new BusinessException("유효하지 않은 Google credential입니다");
    }

    const body = await res.json() as {
      sub?: string;
      email?: string;
      name?: string;
      aud?: string;
    };

    // aud가 등록된 클라이언트 ID와 일치하는지 검증
    if (body.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new BusinessException("유효하지 않은 Google credential입니다");
    }

    if (!body.sub || !body.email || !body.name) {
      throw new BusinessException("Google 계정 정보를 가져올 수 없습니다");
    }

    return { googleId: body.sub, email: body.email, name: body.name };
  },
};
