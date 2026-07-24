export interface IAiClient {
  analyzeMemos: (memos: { title: string; content: string }[]) => Promise<string>;
}
