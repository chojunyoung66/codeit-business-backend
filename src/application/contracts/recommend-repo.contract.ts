export interface IRecommendRepo {
  create: (params: { userId: number; articleId: number }) => Promise<{ id: number; userId: number; articleId: number; createdAt: Date }>;
  delete: (id: number) => Promise<{ id: number; userId: number; articleId: number; createdAt: Date }>;
  findByUserIdAndArticleId: (params: { userId: number; articleId: number }) => Promise<{ id: number; userId: number; articleId: number; createdAt: Date } | null>;
}
