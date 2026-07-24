import { GoogleGenAI } from "@google/genai";
import { IAiClient } from "../../application/contracts/ai-client.contract.js";

export const createGeminiMemoAnalyzer = (): IAiClient => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const extractKeywords: IAiClient["extractKeywords"] = async (memos) => {
    // 메모 텍스트 포맷
    const memoText = memos
      .map((m, i) => `메모 ${i + 1}\n제목: ${m.title}\n내용: ${m.content}`)
      .join("\n\n");

    // Step 1: 관심 키워드 추출
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `다음 메모들에서 사용자의 관심사를 나타내는 핵심 키워드를 쉼표로 구분해 추출해주세요. 키워드만 반환하세요.\n\n${memoText}`,
    });

    return response.text ?? "";
  };

  const recommendTopics: IAiClient["recommendTopics"] = async (keywords) => {
    // Step 2: 키워드 기반 새 주제 추천
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `관심 키워드: ${keywords}\n\n이 사용자가 탐색해볼 만한 새로운 주제를 한국어로 추천해주세요.`,
    });

    return response.text ?? "";
  };

  return { extractKeywords, recommendTopics };
};
