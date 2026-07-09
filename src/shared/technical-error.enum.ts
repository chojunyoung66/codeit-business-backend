export enum TechnicalErrorCode {
  // 인증 관련 - JWT 설정
  JWT_SECRET_NOT_FOUND = "JWT_SECRET_NOT_FOUND",

  // 인증 관련 - JWT 검증 실패 상세
  JWT_EXPIRED = "JWT_EXPIRED",
  JWT_INVALID_SIGNATURE = "JWT_INVALID_SIGNATURE",
  JWT_MALFORMED = "JWT_MALFORMED",
  JWT_VERIFICATION_ERROR = "JWT_VERIFICATION_ERROR",

  // 데이터베이스 관련
  DATABASE_CONNECTION_FAILED = "DATABASE_CONNECTION_FAILED",
  DATABASE_QUERY_FAILED = "DATABASE_QUERY_FAILED",

  // 시스템 관련
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export const technicalErrorMessages: Record<TechnicalErrorCode, string> = {
  [TechnicalErrorCode.JWT_SECRET_NOT_FOUND]: "JWT 설정이 누락되었습니다.",
  [TechnicalErrorCode.JWT_EXPIRED]: "토큰이 만료되었습니다.",
  [TechnicalErrorCode.JWT_INVALID_SIGNATURE]:
    "토큰의 서명이 유효하지 않습니다.",
  [TechnicalErrorCode.JWT_MALFORMED]: "토큰의 형식이 올바르지 않습니다.",
  [TechnicalErrorCode.JWT_VERIFICATION_ERROR]:
    "토큰 검증 중 오류가 발생했습니다.",
  [TechnicalErrorCode.DATABASE_CONNECTION_FAILED]:
    "데이터베이스 연결에 실패했습니다.",
  [TechnicalErrorCode.DATABASE_QUERY_FAILED]:
    "데이터베이스 쿼리 실행 중 오류가 발생했습니다.",
  [TechnicalErrorCode.INTERNAL_SERVER_ERROR]: "서버 내부 오류가 발생했습니다.",
  [TechnicalErrorCode.UNKNOWN_ERROR]: "알 수 없는 오류가 발생했습니다.",
};
