export interface IAiClient {
  extractKeywords: (
    memos: { title: string; content: string }[],
  ) => Promise<string>;
  recommendTopics: (keywords: string) => Promise<string>;
}
