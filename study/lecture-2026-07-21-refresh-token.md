# 강의 요약: Access + Refresh Token (2026-07-21)

`codeit-business-backend` 인증 재설계용 정리.  
목표: JWT 1개(MVP) → Access(짧음) + Refresh(김, HttpOnly 쿠키 + DB) + Rotation.

---

## 1. 큰 그림

```
로그인 성공
  ├─ Access Token  (예: 15m) → JSON 응답 → FE가 Bearer로 사용
  └─ Refresh Token (예: 7d)  → DB 저장 + Set-Cookie
       Cookie 옵션:
         - HttpOnly: true          → JS(XSS)가 못 읽음
         - Path: /api/auth/refresh → 이 경로 요청에만 자동 첨부
         - SameSite: Lax (또는 Strict)
         - Secure: true            → 프로덕션 HTTPS
         - Domain: API 호스트와 맞춤 (localhost 등)

일반 API: Authorization: Bearer <access> 만 사용
Access 만료 → POST /api/auth/refresh
  → 쿠키 refresh 자동 첨부 → 검증 → 구 refresh 폐기
  → 새 access + 새 refresh 발급 (Refresh Token Rotation)

회원가입: 토큰 발급 안 함 → 로그인 따로
로그아웃: DB refresh null + clearCookie(동일 Path/옵션)
```

---

## 2. 왜 Access / Refresh를 나누나

| 항목 | Access | Refresh |
|------|--------|---------|
| 수명 | 짧음 | 김 |
| 전달 | JSON / Bearer | HttpOnly 쿠키 |
| 용도 | API 인증 | Access 재발급 |
| XSS | 탈취되면 피해 시간 짧음 | JS로 읽기 불가 |

Refresh는 DB에도 저장한다. 로그아웃·로테이션 후 **서명만 맞는 옛 토큰은 거부**한다.

---

## 3. Refresh Token Rotation (최소 버전)

1. 클라이언트가 `POST /api/auth/refresh` 호출 (쿠키 자동 첨부)
2. JWT 서명/만료 검증
3. DB에 저장된 refresh와 **일치**하는지 확인  
   - 불일치(로그아웃·이미 교체됨) → `INVALID_REFRESH_TOKEN`, 거부
4. **새 Access + 새 Refresh** 발급
5. DB의 refresh를 새 값으로 교체 (구 토큰 무효화)
6. 새 Refresh를 다시 Set-Cookie, Access는 JSON

“Access만 다시 주고 Refresh는 그대로”가 아니라, **Refresh도 매번 새로 만드는 것**이 최소 Rotation이다.

---

## 4. Cookie 옵션 (DevTools에서 확인할 것)

로그인 후 Application → Cookies에서 Refresh를 본다.

| 옵션 | 의미 |
|------|------|
| Name | `refreshToken` |
| Domain | 호스트와 맞아야 저장/표시됨 (`localhost` vs `127.0.0.1` 혼동 주의) |
| Path | `/api/auth/refresh` — 다른 API에는 안 붙음 |
| Expires / Session | 만료되면 쿠키 삭제 |
| HttpOnly | 체크됨 → `document.cookie`로 못 읽음 |
| Secure | HTTPS에서만 전송 (로컬 http면 보통 false) |
| SameSite | 크로스 사이트 전송 제한 (Lax 권장) |

**안 보일 때:** 보안 버그가 아니라 **옵션/도메인/Path/credentials** 문제인 경우가 많다.

---

## 5. Path가 중요한 이유

| 요청 | Access | Refresh 쿠키 |
|------|--------|--------------|
| `GET /api/...` 일반 API | Bearer | 안 붙음 (Path 제한) |
| `POST /api/auth/refresh` | 만료되어도 OK | **자동 첨부** |

쿠키 “자동 전송”을 막지는 못하지만, **전송 범위를 refresh 엔드포인트로 축소**한다.

---

## 6. XSS와의 관계 (이론)

- XSS 스크립트는 `localStorage`의 토큰은 읽기 쉽다.
- Refresh를 **HttpOnly 쿠키**에 두면, 페이지에 심긴 스크립트가 Refresh를 읽어 탈취하기 어렵다.
- 한계: 사람이 브라우저 DevTools를 직접 보면 쿠키는 보인다.  
  HttpOnly는 **스크립트 탈취**를 막는 것이지, 물리/브라우저 접근까지 막는 것은 아니다.

---

## 7. API 플로우 (Controller)

| Method | Path | 동작 |
|--------|------|------|
| POST | `/api/auth/signup` | 유저만 생성 (토큰 없음) |
| POST | `/api/auth/signin` | Access → JSON, Refresh → 쿠키 + DB |
| POST | `/api/auth/refresh` | Rotation → 새 Access(JSON) + 새 Refresh(쿠키) |
| POST | `/api/auth/logout` | DB Refresh 삭제 + `clearCookie` |

CORS: FE `credentials: 'include'` + BE `cors({ origin: FE, credentials: true })`  
(`Access-Control-Allow-Origin: *` 와 credentials는 함께 불가)

---

## 8. 구현 순서 (TDD 권장)

1. Prisma: `User.refreshToken String? @unique`
2. JWT 만료 분리: Access `15m`, Refresh `7d`
3. Repo: `updateRefreshToken`, `findByRefreshToken`
4. Service: signup(무토큰), signin, refresh(rotation), signout
5. Controller: cookie Path/HttpOnly + login/logout/refresh
6. CORS credentials + FE origin
7. Frontend (후속): Access 보관, 401 시 refresh 후 재시도

---

## 9. 눈으로 확인하는 체크리스트

로그인 후:

- [ ] 응답 JSON에 **Access token** 있음
- [ ] Cookies에 **refreshToken** 있음
- [ ] Path = `/api/auth/refresh`
- [ ] HttpOnly 체크됨
- [ ] Domain이 실제 접속 호스트와 일치
- [ ] `POST /api/auth/refresh` 시 새 Access + 새 Refresh
- [ ] 로그아웃 후 같은 Refresh로 refresh 실패

---

## 10. 다음에 할 일 (Frontend)

- Access: 메모리(또는 단기 저장) + Bearer
- Refresh 요청에만 `credentials: include`
- Access 401 → `/api/auth/refresh` → 원요청 재시도
- localStorage 단일 장기 JWT 의존 축소

---

## 11. 의도적으로 나중에

- Refresh 재사용 감지 시 해당 유저 세션 전체 차단
- CSRF / Double Submit
- 디바이스별 Refresh 다중 발급 (테이블 1:N)

---

## 한 줄 결론

**짧은 Access는 JSON으로, 긴 Refresh는 HttpOnly+Path 제한 쿠키와 DB에 두고, refresh마다 Refresh도 갈아끼운다(Rotation).**  
쿠키가 안 보이면 보안 실패가 아니라 Domain/Path/SameSite/credentials 옵션부터 본다.
