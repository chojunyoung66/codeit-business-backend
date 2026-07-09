import { createJwtUtil } from "../../utils/jwt.util.js";
import { BusinessException } from "../../shared/business.exception.js";
import { TechnicalException } from "../../shared/technical.exception.js";
import { TechnicalErrorCode, technicalErrorMessages, } from "../../shared/technical-error.enum.js";
export const authMiddleware = (req, res, next) => {
    // 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // 토큰이 없으면 비즈니스 에러
        throw new BusinessException("인증 토큰이 필요합니다.");
    }
    const token = authHeader.substring(7);
    try {
        // JWT 토큰 검증
        const jwtUtil = createJwtUtil();
        const decoded = jwtUtil.verify(token);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        // 에러 코드 추출
        const errorCode = error?.code;
        // JWT 토큰 관련 기술적 에러는 TechnicalException으로 처리
        if (errorCode === "JWT_EXPIRED" ||
            errorCode === "JWT_INVALID_SIGNATURE" ||
            errorCode === "JWT_MALFORMED" ||
            errorCode === "JWT_VERIFICATION_ERROR") {
            throw new TechnicalException(error instanceof Error ? error.message : "토큰 검증 실패", errorCode);
        }
        // JWT_SECRET이 없으면 설정 오류
        if (!process.env.JWT_SECRET) {
            throw new TechnicalException(technicalErrorMessages[TechnicalErrorCode.JWT_SECRET_NOT_FOUND], TechnicalErrorCode.JWT_SECRET_NOT_FOUND);
        }
        // 예상치 못한 에러는 기술적 에러
        throw new TechnicalException(technicalErrorMessages[TechnicalErrorCode.UNKNOWN_ERROR], TechnicalErrorCode.UNKNOWN_ERROR);
    }
};
