# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 환경 세팅

### 필수 준비 사항
- Node.js 18+ 설치
- PostgreSQL 데이터베이스 연결 설정 (`.env` 파일에 `DATABASE_URL` 설정)
- `.env` 파일 생성: `JWT_SECRET`, `DATABASE_URL` 필수

### 자주 사용하는 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 (tsx watch 사용, 자동 재시작) |
| `npm run build` | TypeScript를 JavaScript로 컴파일 (`dist/` 디렉토리 생성) |
| `npm start` | 빌드된 JavaScript 파일 실행 |
| `npm run test` | 모든 테스트 실행 |
| `npm run test -- path/to/file.test.ts` | 특정 테스트 파일만 실행 |
| `npm run type:check` | TypeScript 타입 검사 (컴파일하지 않고 타입만 확인) |
| `npm run type` | 타입 검사 (명령어 별칭, 작업 완료 후 실행) |
| `npm run format` | Prettier로 코드 포매팅 |

### 데이터베이스 마이그레이션
```bash
npx prisma migrate dev --name <migration_name>  # 마이그레이션 생성 및 실행
npx prisma db push                              # 스키마를 DB에 적용
npx prisma generate                             # Prisma Client 생성 (생략 가능, 자동 실행)
```

## 아키텍처 개요

이 프로젝트는 **계층화된 아키텍처(Layered Architecture)**를 따릅니다.

### 디렉토리 구조

```
src/
├── index.ts                    # 애플리케이션 진입점
├── bootstrap.ts                # 의존성 주입 설정
├── application/                # 비즈니스 로직
│   ├── services/              # 서비스 구현체 (비즈니스 로직)
│   └── contracts/             # 인터페이스/계약서
├── inbound/                    # 입력층 (HTTP 요청 처리)
│   ├── controllers/           # 라우터 및 핸들러
│   ├── middlewares/           # Express 미들웨어
│   └── schemas/               # Zod를 이용한 요청 스키마
├── outbound/                   # 출력층 (외부 시스템 연동)
│   ├── repos/                 # 저장소 구현체
│   └── externals/             # 외부 API/서비스
├── utils/                      # 유틸리티 함수
├── shared/                     # 공유 코드 (예외, 타입)
└── db/                         # 데이터베이스 설정
```

### 데이터 흐름

1. **Controller** (HTTP 요청) → 2. **Service** (비즈니스 로직) → 3. **Repository** (데이터 접근) → 4. **Prisma** (DB)

### 핵심 설계 패턴

#### 1. 의존성 주입 (Dependency Injection)
- `bootstrap.ts`에서 모든 의존성 초기화 및 연결
- 각 계층은 필요한 인터페이스를 주입받음
- 단위 테스트 시 Mock 객체 주입으로 테스트 용이

**예시:**
```typescript
// bootstrap.ts
const authService = createAuthService(userRepo, jwtUtil, bcryptUtil);

// auth.service.ts
export const createAuthService = (
  userRepo: UserRepo,
  jwtUtil: JwtUtil,
  bcryptUtil: BcryptUtil,
) => {
  // 서비스 구현
};
```

#### 2. 인터페이스 계약 (Interface Contracts)
- 모든 외부 의존성은 반드시 인터페이스(`contracts/`)가 존재해야 함
- `application/contracts/` 디렉토리에 인터페이스 정의
- 구현체를 쉽게 교체할 수 있도록 설계

#### 3. 예외 처리
- **BusinessException**: 비즈니스 로직 오류 (고객에게 메시지 전달)
- **TechnicalException**: 시스템 오류 (개발자에게 로깅)
- 에러 미들웨어에서 일괄 처리

#### 4. 비동기 핸들러 패턴
```typescript
const asyncHandler = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next);

router.post("/endpoint", asyncHandler(async (req, res) => {
  // async 로직
}));
```

## 서비스 코드 작성 가이드

### TDD 원칙 (Test-Driven Development)

1. **Happy Path 테스트 작성** → 테스트 실패 확인 → 서비스 구현
2. Happy Path 구현 완료 후 개발자 검토 요청
3. 검토 완료 후, 최대 2개의 크리티컬한 엣지 케이스만 개발자와 협의하여 추가 테스트
4. 모든 테스트 통과 확인 후 `npm run type` 실행

**테스트 파일 작성 시:**
- 파일명: `*.test.ts` 또는 `*.spec.ts`
- Jest를 사용하여 단위 테스트 작성
- Mock 객체는 `contracts/__mocks__` 디렉토리에 위치

### 코드 작성 가이드

#### 함수 주석
- 함수 내부 논리 단위로 한 문장 주석 추가
- 핵심만 짧고 간결하게 작성
- WHY를 명확하게 (비논리적이거나 숨겨진 제약만)

```typescript
const signInService = async (params) => {
  // 사용자 조회
  const foundUser = await userRepo.findUserByEmail(email);
  if (foundUser == null) {
    throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
  }

  // 비밀번호 검증
  const isPasswordValid = await bcryptUtil.compare(password, foundUser.password);
  if (!isPasswordValid) {
    throw new BusinessException("이메일 또는 비밀번호가 일치하지 않습니다");
  }

  // JWT 토큰 생성
  const token = jwtUtil.sign({ userId: foundUser.id }, 3600);
  return token;
};
```

#### 문서 작성
- 한글로 작성
- 200줄 이하로 완성

### 작업 완료 체크리스트

- [ ] 모든 의존성이 인터페이스로 정의됨 (필수)
- [ ] 테스트 코드 작성 및 통과
- [ ] `npm run test` 실행하여 테스트 검증
- [ ] `npm run type` 실행하여 타입 에러 해결
- [ ] 기존 테스트 실패 시 원인 분석 (새로 작성한 테스트에서 실패한 경우만 수정)

## Prisma 및 데이터베이스

### Prisma 클라이언트 사용
- 자동 생성된 클라이언트: `src/generated/prisma`
- `src/db/prisma.ts`에서 싱글톤 인스턴스 관리
- 모든 Repository에서 이 인스턴스 사용

### 스키마 수정
1. `prisma/schema.prisma` 수정
2. `npx prisma migrate dev --name <name>` 실행
3. 마이그레이션 파일이 `src/db/migrations/`에 생성됨

## 테스팅 전략

### 단위 테스트 (Service Layer)
- Mock Repository 사용
- 비즈니스 로직 검증에 집중
- Happy Path → 크리티컬 엣지 케이스 순으로 작성

### 통합 테스트 (Controller Layer)
- `supertest` 사용하여 HTTP 요청 테스트
- 실제 Express 라우터 테스트
- 요청/응답 검증

### Mock 객체 작성
- `application/contracts/__mocks__` 디렉토리에 저장
- 인터페이스를 구현하는 가짜 객체
- 테스트에서 의존성 주입 시 사용

## 배포 및 빌드

### 로컬 빌드
```bash
npm run build
npm start
```

### 환경 변수 설정
프로덕션 배포 시 필수:
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: JWT 서명용 비밀키

## 문제 해결

### 테스트 실패
- 새로 작성한 테스트: 직접 수정
- 기존 테스트: 원인 분석 후 작업 중단 후 리포팅

### 타입 에러
- `npm run type` 실행하여 모든 타입 에러 확인 및 수정

### 의존성 관련 에러
- 모든 의존성이 `contracts/`에 인터페이스로 정의되어 있는지 확인
- 누락된 인터페이스가 있으면 먼저 생성 후 진행
