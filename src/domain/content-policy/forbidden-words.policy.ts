import type { ForbiddenWordsPolicy } from "./content.policy.interface.js";

const DEFAULT_FORBIDDEN_WORDS = [
  "비방",
  "욕설",
  "스팸",
  "광고",
  "부적절한",
];

export const createForbiddenWordsPolicy = (
  customWords?: string[],
): ForbiddenWordsPolicy => {
  const forbiddenWords = customWords ?? DEFAULT_FORBIDDEN_WORDS;

  const containsForbiddenWord = (text: string): boolean => {
    return forbiddenWords.some((word) =>
      text.toLowerCase().includes(word.toLowerCase()),
    );
  };

  const getForbiddenWords = (): string[] => {
    return [...forbiddenWords];
  };

  return { containsForbiddenWord, getForbiddenWords };
};
