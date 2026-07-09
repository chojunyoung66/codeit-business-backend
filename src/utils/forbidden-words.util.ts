const FORBIDDEN_WORDS = [
  "비방",
  "욕설",
  "스팸",
  "광고",
  "부적절한",
];

export const createForbiddenWordsUtil = () => {
  const containsForbiddenWord = (text: string): boolean => {
    return FORBIDDEN_WORDS.some((word) =>
      text.toLowerCase().includes(word.toLowerCase()),
    );
  };

  return { containsForbiddenWord };
};

export type ForbiddenWordsUtil = ReturnType<
  typeof createForbiddenWordsUtil
>;
