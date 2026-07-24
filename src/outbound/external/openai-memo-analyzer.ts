import OpenAI from "openai";
import { IAiClient } from "../../application/contracts/ai-client.contract.js";

export const createOpenAiMemoAnalyzer = (): IAiClient => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const analyzeMemos: IAiClient["analyzeMemos"] = async (memos) => {
    // 메모 목록을 텍스트로 포맷
    const memoText = memos
      .map((m, i) => `메모 ${i + 1}\n제목: ${m.title}\n내용: ${m.content}`)
      .join("\n\n");

    // OpenAI에 분석 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "사용자의 메모를 분석하는 어시스턴트입니다. 메모들의 주제, 패턴, 특징을 한국어로 간결하게 분석해주세요.",
        },
        {
          role: "user",
          content: `다음 메모들을 분석해주세요:\n\n${memoText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI가 빈 응답을 반환했습니다.");
    }
    return content;
  };

  return { analyzeMemos };
};
