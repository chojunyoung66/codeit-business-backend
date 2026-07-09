export const createArticleRepoMock = (initialArticles) => {
  const articles = initialArticles ? [...initialArticles] : [];
  return {
    findAll: async () => {
      // 최신순으로 정렬하여 반환
      return articles
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    findById: async (id) => articles.find((a) => a.id === id) ?? null,
    createArticle: async (data) => {
      // 새 ID 생성
      const newId = articles.length ? articles[articles.length - 1].id + 1 : 1;
      const newArticle = {
        id: newId,
        userId: data.userId,
        title: data.title,
        content: data.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      articles.push(newArticle);
      return newArticle;
    },
    updateArticle: async (id, data) => {
      // 게시글 찾기
      const idx = articles.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Article not found");
      // 업데이트
      articles[idx] = { ...articles[idx], ...data, updatedAt: new Date() };
      return articles[idx];
    },
    deleteArticle: async (id) => {
      // 게시글 찾기
      const idx = articles.findIndex((a) => a.id === id);
      if (idx === -1) throw new Error("Article not found");
      // 삭제
      const [deleted] = articles.splice(idx, 1);
      return deleted;
    },
  };
};
