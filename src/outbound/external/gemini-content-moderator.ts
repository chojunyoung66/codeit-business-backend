import { GoogleGenAI } from "@google/genai";
import { IContentModerator } from "../../application/contracts/content-moderator.contract.js";

export const createGeminiContentModerator = (): IContentModerator => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const isInappropriate: IContentModerator["isInappropriate"] = async ({
    title,
    content,
  }) => {
    // Gemini에게 부적절 여부를 YES/NO로 판단 요청
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `다음 텍스트가 욕설, 혐오, 폭력 등 부적절한 내용을 포함하는지 판단하세요. "YES" 또는 "NO"만 답하세요.\n\n제목: ${title}\n내용: ${content}`,
    });

    return (response.text ?? "").trim().toUpperCase().startsWith("YES");
  };

  return { isInappropriate };
};
