import { IMemoRepo } from "../contracts/memo-repo.contract.js";
import { IUserRepo } from "../contracts/user-repo.contract.js";
import { IAiClient } from "../contracts/ai-client.contract.js";
import { IContentModerator } from "../contracts/content-moderator.contract.js";
import { BusinessException } from "../../shared/exceptions/business.exception.js";
import {
  TechnicalException,
  TechnicalExceptionCode,
} from "../../shared/exceptions/technical.exception.js";

export const createMemoService = (
  findAll: IMemoRepo["findAll"],
  create: IMemoRepo["create"],
  findUserById: IUserRepo["findUserById"],
  findById: IMemoRepo["findById"],
  update: IMemoRepo["update"],
  deleteMemoRepo: IMemoRepo["delete"],
  findLatestByUserId: IMemoRepo["findLatestByUserId"],
  extractKeywords: IAiClient["extractKeywords"],
  recommendTopics: IAiClient["recommendTopics"],
  isInappropriate: IContentModerator["isInappropriate"],
) => {
  // 존재하는 모든 메모를 추천 개수, 내 추천 여부와 함께 조회
  const getAllMemos = async (userId: number) => {
    const memos = await findAll(userId);
    return memos;
  };

  // 새로운 메모 생성
  const createMemo = async (params: {
    userId: number;
    title: string;
    content: string;
  }) => {
    // AI 콘텐츠 검증
    if (
      await isInappropriate({ title: params.title, content: params.content })
    ) {
      throw new BusinessException("게시글을 작성할 수 없습니다.");
    }

    // 사용자 존재 확인
    const user = await findUserById(params.userId);
    if (!user) {
      throw new BusinessException("존재하지 않는 유저입니다.");
    }

    const newMemo = await create(params);
    return newMemo;
  };

  // 메모 업데이트
  const updateMemo = async (params: {
    memoId: number;
    userId: number;
    title?: string;
    content?: string;
  }) => {
    // 메모 존재 확인
    const memo = await findById(params.memoId);
    if (!memo) {
      throw new BusinessException("존재하지 않는 메모입니다.");
    }

    // 소유자 확인
    if (memo.userId !== params.userId) {
      throw new BusinessException("메모를 수정할 권한이 없습니다.");
    }

    // 메모 작성자 존재 확인
    const memoAuthor = await findUserById(memo.userId);
    if (!memoAuthor) {
      throw new BusinessException("존재하지 않는 유저입니다.");
    }

    // AI 콘텐츠 검증
    const title = params.title ?? memo.title;
    const content = params.content ?? memo.content;
    if (await isInappropriate({ title, content })) {
      throw new BusinessException("게시글을 작성할 수 없습니다.");
    }

    // 메모 업데이트
    const updatedMemo = await update({
      id: params.memoId,
      title: params.title,
      content: params.content,
    });
    return updatedMemo;
  };

  // 메모 삭제
  const deleteMemo = async (params: { memoId: number; userId: number }) => {
    // 메모 존재 확인
    const memo = await findById(params.memoId);
    if (!memo) {
      throw new BusinessException("존재하지 않는 메모입니다.");
    }

    // 소유자 확인
    if (memo.userId !== params.userId) {
      throw new BusinessException("메모를 삭제할 권한이 없습니다.");
    }

    const deletedMemo = await deleteMemoRepo(params.memoId);
    return deletedMemo;
  };

  // 최근 메모 10개 기반 관심 주제 추천 (2단계 프롬프트 체인)
  const analyzeMemos = async (userId: number): Promise<string> => {
    // 최근 메모 10개 조회
    const memos = await findLatestByUserId(userId, 10);

    // 메모 없으면 예외
    if (memos.length === 0) {
      throw new BusinessException("분석할 메모가 없습니다.");
    }

    try {
      // Step 1: 관심 키워드 추출
      const keywords = await extractKeywords(
        memos.map(({ title, content }) => ({ title, content })),
      );
      // Step 2: 키워드 기반 새 주제 추천
      return await recommendTopics(keywords);
    } catch (err) {
      throw new TechnicalException(
        "AI 분석 중 오류가 발생했습니다.",
        TechnicalExceptionCode.AI_ANALYSIS_FAILED,
        err,
      );
    }
  };

  return { getAllMemos, createMemo, updateMemo, deleteMemo, analyzeMemos };
};

export type MemoServiceType = ReturnType<typeof createMemoService>;
