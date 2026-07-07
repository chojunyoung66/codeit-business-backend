import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    memos: [
      {
        id: 1,
        email: "asd@asd.com",
        title: "주간 업무 정리",
        content:
          "월요일까지 기획안 초안 작성, 화요일 팀 리뷰 후 수정, 목요일 최종 제출 예정.",
        createdAt: "2026-06-02T09:15:00.000Z",
      },
      {
        id: 2,
        email: "asd@asd.com",
        title: "React Query 스터디 노트",
        content:
          "queryKey 배열 첫 번째 요소는 네임스페이스처럼 써야 함. staleTime 기본값은 0이라 매번 재요청함. 필요하면 Infinity로 설정.",
        createdAt: "2026-06-08T14:30:00.000Z",
      },
      {
        id: 3,
        email: "asd@asd.com",
        title: "점심 메뉴 후보",
        content:
          "1. 순대국밥 2. 김치찌개 3. 샐러드 (다이어트 중이면 3번). 내일은 무조건 3번.",
        createdAt: "2026-06-12T11:50:00.000Z",
      },
      {
        id: 4,
        email: "asd@asd.com",
        title: "독서 메모 - 클린 코드",
        content:
          "함수는 한 가지 일만 해야 한다. 이름은 의도를 드러내야 한다. 주석보다 코드 자체로 설명하라.",
        createdAt: "2026-06-18T21:00:00.000Z",
      },
      {
        id: 5,
        email: "asd@asd.com",
        title: "7월 여행 계획",
        content:
          "제주도 2박 3일. 숙소: 성산일출봉 근처 게스트하우스. 렌트카 예약 필요. 흑돼지 필수.",
        createdAt: "2026-06-22T19:20:00.000Z",
      },
      {
        id: 6,
        email: "qwe@qwe.com",
        title: "운동 루틴",
        content:
          "월/수/금: 헬스장 (가슴+삼두 / 등+이두 / 하체). 화/목: 30분 러닝. 주말은 자유.",
        createdAt: "2026-06-05T07:00:00.000Z",
      },
      {
        id: 7,
        email: "qwe@qwe.com",
        title: "이번 달 지출 내역",
        content:
          "식비 32만원, 교통비 8만원, 구독 서비스 3만원, 기타 15만원. 다음 달은 식비 줄이기.",
        createdAt: "2026-06-14T20:10:00.000Z",
      },
      {
        id: 8,
        email: "qwe@qwe.com",
        title: "사이드 프로젝트 아이디어",
        content:
          "가계부 앱인데 카테고리 자동 분류 기능 넣으면 차별화 가능할 듯. 기술 스택은 React Native + Supabase 검토 중.",
        createdAt: "2026-06-20T16:45:00.000Z",
      },
    ],
  });
});
router.post("/", (req, res) => {
  return res.json({
    memo: {
      id: 1,
      email: "asd@asd.com",
      title: "주간 업무 정리",
      content:
        "월요일까지 기획안 초안 작성, 화요일 팀 리뷰 후 수정, 목요일 최종 제출 예정.",
      createdAt: "2026-06-02T09:15:00.000Z",
    },
  });
});

export default router;