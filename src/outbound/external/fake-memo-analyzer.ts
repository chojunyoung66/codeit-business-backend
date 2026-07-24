import { IAiClient } from "../../application/contracts/ai-client.contract.js";

export const createFakeMemoAnalyzer = (): IAiClient => {
  const extractKeywords: IAiClient["extractKeywords"] = async (memos) => {
    // 실제 AI 없이 제목 기반 키워드 반환
    const titles = memos.map((m) => m.title).join(", ");
    return `[FAKE 키워드] ${titles}`;
  };

  const recommendTopics: IAiClient["recommendTopics"] = async (keywords) => {
    // 추출된 키워드 기반 고정 추천 반환
    return `[FAKE 추천] "${keywords}" 관련 주제를 추천합니다.`;
  };

  return { extractKeywords, recommendTopics };
};
