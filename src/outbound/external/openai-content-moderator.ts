import OpenAI from "openai";
import { IContentModerator } from "../../application/contracts/content-moderator.contract.js";

export const createOpenAiContentModerator = (): IContentModerator => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const isInappropriate: IContentModerator["isInappropriate"] = async ({ title, content }) => {
    // OpenAI Moderation API로 유해 콘텐츠 탐지
    const response = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: `${title} ${content}`,
    });
    return response.results[0].flagged;
  };

  return { isInappropriate };
};
