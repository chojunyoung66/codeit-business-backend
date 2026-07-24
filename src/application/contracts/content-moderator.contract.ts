export interface IContentModerator {
  isInappropriate: (params: { title: string; content: string }) => Promise<boolean>;
}
