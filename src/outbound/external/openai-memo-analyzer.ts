import OpenAI from "openai";
import { IAiClient } from "../../application/contracts/ai-client.contract.js";

export const createOpenAiMemoAnalyzer = (): IAiClient => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const extractKeywords: IAiClient["extractKeywords"] = async (memos) => {
    // 메모 텍스트 포맷
    const memoText = memos
      .map((m, i) => `메모 ${i + 1}\n제목: ${m.title}\n내용: ${m.content}`)
      .join("\n\n");

    // Step 1: 관심 키워드 추출
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "사용자의 메모에서 관심사를 나타내는 핵심 키워드를 쉼표로 구분해 추출해주세요. 키워드만 반환하세요.",
        },
        {
          role: "user",
          content: `다음 메모들에서 관심 키워드를 추출해주세요:\n\n${memoText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI가 빈 응답을 반환했습니다.");
    return content;
  };

  const recommendTopics: IAiClient["recommendTopics"] = async (keywords) => {
    // Step 2: 키워드 기반 새 주제 추천
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "사용자의 관심 키워드를 바탕으로 탐색해볼 만한 새로운 주제를 한국어로 추천해주세요.",
        },
        {
          role: "user",
          content: `관심 키워드: ${keywords}\n\n이 사용자에게 새로운 주제를 추천해주세요.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("OpenAI가 빈 응답을 반환했습니다.");
    return content;
  };

  return { extractKeywords, recommendTopics };
};
