import { describe, it, expect, jest } from "@jest/globals";
import { createMemoService } from "./memo.service.js";
import { IMemoRepo } from "../contracts/memo-repo.contract.js";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IAiClient } from "../contracts/ai-client.contract.js";
import { IContentModerator } from "../contracts/content-moderator.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

describe("MemoService", () => {
  describe("getAllMemos", () => {
    it("존재하는 모든 메모를 추천 개수, 작성자 이름, 내 추천 여부와 함께 조회한다", async () => {
      // 테스트용 Mock 메모 데이터 (추천 개수, 작성자 이름, 내 추천 여부 포함)
      const mockMemos = [
        {
          id: 1,
          title: "첫 번째 메모",
          content: "내용1",
          userId: 2,
          createdAt: new Date(),
          recommendCount: 3,
          username: "김민지",
          isRecommended: true,
        },
        {
          id: 2,
          title: "두 번째 메모",
          content: "내용2",
          userId: 3,
          createdAt: new Date(),
          recommendCount: 0,
          username: "박준호",
          isRecommended: false,
        },
      ];

      // Mock findAll
      const mockFindAll = jest
        .fn<IMemoRepo["findAll"]>()
        .mockResolvedValue(mockMemos as any);

      // MemoService 생성
      const memoService = createMemoService(
        mockFindAll,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // getAllMemos 호출
      const result = await memoService.getAllMemos(1);

      // 검증
      expect(result).toEqual(mockMemos);
      expect(mockFindAll).toHaveBeenCalledWith(1);
    });
  });

  describe("createMemo", () => {
    it("새로운 메모를 생성한다", async () => {
      // 테스트용 Mock 메모 데이터
      const newMemo = {
        id: 1,
        title: "새 메모",
        content: "내용",
        userId: 1,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1, email: "test@test.com" } as any);

      const mockCreate = jest
        .fn<IMemoRepo["create"]>()
        .mockResolvedValue(newMemo as any);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        mockCreate,
        mockFindUserById,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // createMemo 호출
      const result = await memoService.createMemo({
        userId: 1,
        title: "새 메모",
        content: "내용",
      });

      // 검증
      expect(result).toEqual(newMemo);
      expect(mockCreate).toHaveBeenCalledWith({
        userId: 1,
        title: "새 메모",
        content: "내용",
      });
    });

    it("AI가 부적절 콘텐츠로 판정하면 BusinessException을 던진다", async () => {
      // AI 모더레이터가 부적절 판정
      const mockIsInappropriate = jest
        .fn<IContentModerator["isInappropriate"]>()
        .mockResolvedValue(true);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockIsInappropriate,
      );

      // 부적절 콘텐츠 판정 테스트
      await expect(
        memoService.createMemo({
          userId: 1,
          title: "나쁜 제목",
          content: "나쁜 내용",
        }),
      ).rejects.toThrow(new BusinessException("게시글을 작성할 수 없습니다."));
      expect(mockIsInappropriate).toHaveBeenCalledWith({
        title: "나쁜 제목",
        content: "나쁜 내용",
      });
    });

    it("해당 사용자가 존재하지 않으면 BusinessException을 던진다", async () => {
      // Mock 데이터 - 사용자 없음
      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue(null);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        mockFindUserById,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // createMemo 호출 - 사용자가 없음
      await expect(
        memoService.createMemo({
          userId: 999,
          title: "새 메모",
          content: "내용",
        }),
      ).rejects.toThrow(new BusinessException("존재하지 않는 유저입니다."));

      expect(mockFindUserById).toHaveBeenCalledWith(999);
    });
  });

  describe("updateMemo", () => {
    it("소유자가 메모의 제목과 내용을 업데이트한다", async () => {
      // 기존 메모 데이터
      const existingMemo = {
        id: 1,
        title: "원래 제목",
        content: "원래 내용",
        userId: 1,
        createdAt: new Date(),
      };

      // 업데이트된 메모 데이터
      const updatedMemo = {
        id: 1,
        title: "수정된 제목",
        content: "수정된 내용",
        userId: 1,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindById = jest
        .fn<IMemoRepo["findById"]>()
        .mockResolvedValue(existingMemo as any);

      const mockUpdate = jest
        .fn<IMemoRepo["update"]>()
        .mockResolvedValue(updatedMemo as any);

      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1, email: "test@test.com" } as any);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        mockFindUserById,
        mockFindById,
        mockUpdate,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // updateMemo 호출
      const result = await memoService.updateMemo({
        memoId: 1,
        userId: 1,
        title: "수정된 제목",
        content: "수정된 내용",
      });

      // 검증
      expect(result).toEqual(updatedMemo);
      expect(mockFindById).toHaveBeenCalledWith(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        id: 1,
        title: "수정된 제목",
        content: "수정된 내용",
      });
    });

    it("소유자가 아닌 사용자가 메모를 업데이트하려면 BusinessException을 던진다", async () => {
      // 기존 메모 데이터 (소유자: userId=1)
      const existingMemo = {
        id: 1,
        title: "원래 제목",
        content: "원래 내용",
        userId: 1,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindById = jest
        .fn<IMemoRepo["findById"]>()
        .mockResolvedValue(existingMemo as any);

      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1, email: "test@test.com" } as any);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        mockFindUserById,
        mockFindById,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // updateMemo 호출 - 다른 사용자(userId=2)가 업데이트 시도
      await expect(
        memoService.updateMemo({
          memoId: 1,
          userId: 2,
          title: "수정된 제목",
          content: "수정된 내용",
        }),
      ).rejects.toThrow(
        new BusinessException("메모를 수정할 권한이 없습니다."),
      );
    });

    it("AI가 부적절 콘텐츠로 판정하면 BusinessException을 던진다", async () => {
      // 기존 메모 데이터
      const existingMemo = {
        id: 1,
        title: "원래 제목",
        content: "원래 내용",
        userId: 1,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindById = jest
        .fn<IMemoRepo["findById"]>()
        .mockResolvedValue(existingMemo as any);

      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue({ id: 1, email: "test@test.com" } as any);

      // AI 모더레이터가 부적절 판정
      const mockIsInappropriate = jest
        .fn<IContentModerator["isInappropriate"]>()
        .mockResolvedValue(true);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        mockFindUserById,
        mockFindById,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockIsInappropriate,
      );

      // updateMemo 호출 - AI 부적절 판정
      await expect(
        memoService.updateMemo({
          memoId: 1,
          userId: 1,
          title: "나쁜 제목",
          content: "원래 내용",
        }),
      ).rejects.toThrow(new BusinessException("게시글을 작성할 수 없습니다."));
    });

    it("메모 작성자가 존재하지 않으면 BusinessException을 던진다", async () => {
      // 메모는 존재하지만 작성자가 없는 경우
      const existingMemo = {
        id: 1,
        title: "원래 제목",
        content: "원래 내용",
        userId: 999,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindById = jest
        .fn<IMemoRepo["findById"]>()
        .mockResolvedValue(existingMemo as any);

      const mockFindUserById = jest
        .fn<IUserRepo["findUserById"]>()
        .mockResolvedValue(null);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        mockFindUserById,
        mockFindById,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // updateMemo 호출
      await expect(
        memoService.updateMemo({
          memoId: 1,
          userId: 999,
          title: "수정된 제목",
          content: "수정된 내용",
        }),
      ).rejects.toThrow(new BusinessException("존재하지 않는 유저입니다."));

      expect(mockFindUserById).toHaveBeenCalledWith(999);
    });
  });

  describe("deleteMemo", () => {
    it("소유자가 메모를 삭제한다", async () => {
      // 기존 메모 데이터
      const existingMemo = {
        id: 1,
        title: "원래 제목",
        content: "원래 내용",
        userId: 1,
        createdAt: new Date(),
      };

      // Mock 데이터
      const mockFindById = jest
        .fn<IMemoRepo["findById"]>()
        .mockResolvedValue(existingMemo as any);

      const mockDelete = jest
        .fn<IMemoRepo["delete"]>()
        .mockResolvedValue(existingMemo as any);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockFindById,
        jest.fn() as any,
        mockDelete,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
      );

      // deleteMemo 호출
      const result = await memoService.deleteMemo({
        memoId: 1,
        userId: 1,
      });

      // 검증
      expect(result).toEqual(existingMemo);
      expect(mockFindById).toHaveBeenCalledWith(1);
      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });

  describe("analyzeMemos", () => {
    it("최근 메모 10개로 키워드를 추출하고, 키워드로 주제를 추천한다", async () => {
      // 최근 메모 10개 목데이터
      const recentMemos = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: `메모 ${i + 1}`,
        content: `내용 ${i + 1}`,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      const expectedKeywords = "여행, 독서, 운동";
      const expectedRecommendation =
        "버킷리스트 작성, 독서 모임 참여를 추천합니다.";

      // Mock 데이터
      const mockFindLatestByUserId = jest
        .fn<IMemoRepo["findLatestByUserId"]>()
        .mockResolvedValue(recentMemos as any);
      const mockExtractKeywords = jest
        .fn<IAiClient["extractKeywords"]>()
        .mockResolvedValue(expectedKeywords);
      const mockRecommendTopics = jest
        .fn<IAiClient["recommendTopics"]>()
        .mockResolvedValue(expectedRecommendation);

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockFindLatestByUserId,
        mockExtractKeywords,
        mockRecommendTopics,
        jest.fn() as any,
      );

      // analyzeMemos 호출
      const result = await memoService.analyzeMemos(1);

      // 검증: 10개 조회 → 키워드 추출 → 주제 추천 순서 확인
      expect(mockFindLatestByUserId).toHaveBeenCalledWith(1, 10);
      expect(mockExtractKeywords).toHaveBeenCalledWith(
        recentMemos.map(({ title, content }) => ({ title, content })),
      );
      expect(mockRecommendTopics).toHaveBeenCalledWith(expectedKeywords);
      expect(result).toBe(expectedRecommendation);
    });

    it("메모가 없으면 AI를 호출하지 않고 BusinessException을 던진다", async () => {
      // 빈 메모 목록 반환
      const mockFindLatestByUserId = jest
        .fn<IMemoRepo["findLatestByUserId"]>()
        .mockResolvedValue([]);
      const mockExtractKeywords = jest.fn<IAiClient["extractKeywords"]>();

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockFindLatestByUserId,
        mockExtractKeywords,
        jest.fn() as any,
        jest.fn() as any,
      );

      // 검증
      await expect(memoService.analyzeMemos(1)).rejects.toThrow(
        new BusinessException("분석할 메모가 없습니다."),
      );
      expect(mockExtractKeywords).not.toHaveBeenCalled();
    });

    it("AI 호출이 실패하면 TechnicalException(AI_ANALYSIS_FAILED)을 던진다", async () => {
      // 메모 1개 반환
      const mockFindLatestByUserId = jest
        .fn<IMemoRepo["findLatestByUserId"]>()
        .mockResolvedValue([
          {
            id: 1,
            title: "메모",
            content: "내용",
            userId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as any,
        ]);

      // 키워드 추출 실패
      const mockExtractKeywords = jest
        .fn<IAiClient["extractKeywords"]>()
        .mockRejectedValue(new Error("AI API error"));

      // MemoService 생성
      const memoService = createMemoService(
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        jest.fn() as any,
        mockFindLatestByUserId,
        mockExtractKeywords,
        jest.fn() as any,
        jest.fn() as any,
      );

      // 검증
      const error = await memoService.analyzeMemos(1).catch((e) => e);
      expect(error).toBeInstanceOf(TechnicalException);
      expect((error as TechnicalException).code).toBe(
        TechnicalExceptionCode.AI_ANALYSIS_FAILED,
      );
    });
  });
});
