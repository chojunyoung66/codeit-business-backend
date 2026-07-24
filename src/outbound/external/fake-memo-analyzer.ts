import { IAiClient } from "../../application/contracts/ai-client.contract.js";

export const createFakeMemoAnalyzer = (): IAiClient => {
  const analyzeMemos: IAiClient["analyzeMemos"] = async (memos) => {
    // 실제 AI 호출 없이 고정 응답 반환 (API 키 없이 전체 흐름 테스트용)
    const titles = memos.map((m) => m.title).join(", ");
    return `[FAKE] 총 ${memos.length}개의 메모를 분석했습니다. 주요 메모: ${titles}`;
  };

  return { analyzeMemos };
};
