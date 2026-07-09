import { createForbiddenWordsPolicy } from "./forbidden-words.policy.js";
import type { ContentPolicy } from "./content.policy.interface.js";

export const createContentPolicy = (): ContentPolicy => {
  const forbiddenWords = createForbiddenWordsPolicy();

  return {
    forbiddenWords,
  };
};
