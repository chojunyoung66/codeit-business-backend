import { IContentModerator } from "../../application/contracts/content-moderator.contract.js";

export const createFakeContentModerator = (): IContentModerator => {
  const isInappropriate: IContentModerator["isInappropriate"] = async ({ title, content }) => {
    // 개발/테스트용: "욕설", "금칙어" 포함 시 부적절 판정
    const text = `${title} ${content}`.toLowerCase();
    return text.includes("금칙어") || text.includes("욕설");
  };

  return { isInappropriate };
};
