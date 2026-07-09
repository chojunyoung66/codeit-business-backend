import jwt from "jsonwebtoken";
export const createJwtUtil = () => {
    const sign = (data, expiresIn) => {
        return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
    };
    const verify = (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                const err = new Error("토큰이 만료되었습니다");
                err.code = "JWT_EXPIRED";
                throw err;
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                // 서명 검증 실패
                if (error.message.includes("invalid signature")) {
                    const err = new Error("토큰의 서명이 유효하지 않습니다");
                    err.code = "JWT_INVALID_SIGNATURE";
                    throw err;
                }
                // 형식 오류
                if (error.message.includes("malformed") ||
                    error.message.includes("invalid token")) {
                    const err = new Error("토큰의 형식이 올바르지 않습니다");
                    err.code = "JWT_MALFORMED";
                    throw err;
                }
                // 기타 JWT 오류
                const err = new Error("유효하지 않은 토큰입니다");
                err.code = "JWT_VERIFICATION_ERROR";
                throw err;
            }
            // 예상치 못한 에러
            const err = new Error("토큰 검증 중 예기치 않은 오류가 발생했습니다");
            err.code = "JWT_VERIFICATION_ERROR";
            throw err;
        }
    };
    return { sign, verify };
};
// 하위 호환성을 위한 기존 함수
export const signJwt = (data, expiresIn) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
};
