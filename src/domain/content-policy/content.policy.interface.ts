export interface ForbiddenWordsPolicy {
  containsForbiddenWord(text: string): boolean;
  getForbiddenWords(): string[];
}

export interface ContentPolicy {
  forbiddenWords: ForbiddenWordsPolicy;
}

export type CreateContentPolicy = () => ContentPolicy;
