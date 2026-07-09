import { describe, test, expect } from "@jest/globals";
import { createArticleRepoMock } from "../../application/contracts/__mocks__/article.repo.mock.js";
describe("게시글 저장소 테스트 (Mock)", () => {
  describe("findAll", () => {
    test("모든 게시글을 최신순으로 조회한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "첫 번째 게시글",
          content: "내용 1",
          createdAt: new Date("2026-07-07"),
          updatedAt: new Date("2026-07-07"),
        },
        {
          id: 2,
          userId: 1,
          title: "두 번째 게시글",
          content: "내용 2",
          createdAt: new Date("2026-07-08"),
          updatedAt: new Date("2026-07-08"),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const articles = await repo.findAll();
      // 최신순으로 정렬되어야 함
      expect(articles[0].id).toBe(2);
      expect(articles[1].id).toBe(1);
    });
    test("게시글이 없으면 빈 배열을 반환한다", async () => {
      const repo = createArticleRepoMock([]);
      const articles = await repo.findAll();
      expect(articles).toEqual([]);
    });
    test("같은 시간의 게시글들도 정렬된다", async () => {
      const sameTime = new Date("2026-07-08");
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "첫 번째",
          content: "내용 1",
          createdAt: sameTime,
          updatedAt: sameTime,
        },
        {
          id: 2,
          userId: 1,
          title: "두 번째",
          content: "내용 2",
          createdAt: sameTime,
          updatedAt: sameTime,
        },
        {
          id: 3,
          userId: 1,
          title: "세 번째",
          content: "내용 3",
          createdAt: sameTime,
          updatedAt: sameTime,
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const articles = await repo.findAll();
      // 같은 시간이어도 정렬이 일관되어야 함
      expect(articles.length).toBe(3);
      expect(articles.map((a) => a.id)).toEqual(
        expect.arrayContaining([1, 2, 3]),
      );
    });
  });
  describe("findById", () => {
    test("ID로 게시글을 조회한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "테스트 게시글",
          content: "테스트 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const article = await repo.findById(1);
      expect(article?.id).toBe(1);
      expect(article?.title).toBe("테스트 게시글");
    });
    test("게시글이 없으면 null을 반환한다", async () => {
      const repo = createArticleRepoMock([]);
      const article = await repo.findById(999);
      expect(article).toBeNull();
    });
    test("음수 ID로 조회하면 null을 반환한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "테스트 게시글",
          content: "테스트 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const article = await repo.findById(-1);
      expect(article).toBeNull();
    });
    test("ID 0으로 조회하면 null을 반환한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "테스트 게시글",
          content: "테스트 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const article = await repo.findById(0);
      expect(article).toBeNull();
    });
  });
  describe("createArticle", () => {
    test("새로운 게시글을 생성한다", async () => {
      const repo = createArticleRepoMock([]);
      const article = await repo.createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });
      expect(article.id).toBe(1);
      expect(article.title).toBe("새 게시글");
      expect(article.content).toBe("새 내용");
    });
    test("여러 게시글을 생성할 때 ID가 증가한다", async () => {
      const repo = createArticleRepoMock([]);
      const article1 = await repo.createArticle({
        userId: 1,
        title: "첫 번째",
        content: "내용 1",
      });
      const article2 = await repo.createArticle({
        userId: 1,
        title: "두 번째",
        content: "내용 2",
      });
      expect(article1.id).toBe(1);
      expect(article2.id).toBe(2);
    });
    test("초기 게시글이 있을 때 ID가 올바르게 생성된다", async () => {
      const initialArticles = [
        {
          id: 5,
          userId: 1,
          title: "기존 게시글",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const article = await repo.createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });
      expect(article.id).toBe(6);
    });
    test("생성된 게시글의 createdAt과 updatedAt이 설정된다", async () => {
      const repo = createArticleRepoMock([]);
      const beforeCreate = new Date();
      const article = await repo.createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });
      const afterCreate = new Date();
      expect(article.createdAt).toBeDefined();
      expect(article.updatedAt).toBeDefined();
      expect(article.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(article.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
      expect(article.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(article.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
    test("생성된 게시글이 findAll에서 조회된다", async () => {
      const repo = createArticleRepoMock([]);
      const article = await repo.createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });
      const allArticles = await repo.findAll();
      expect(allArticles.length).toBe(1);
      expect(allArticles[0].id).toBe(article.id);
    });
  });
  describe("updateArticle", () => {
    test("게시글을 수정한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const updated = await repo.updateArticle(1, {
        title: "수정된 제목",
        content: "수정된 내용",
      });
      expect(updated.title).toBe("수정된 제목");
      expect(updated.content).toBe("수정된 내용");
    });
    test("존재하지 않는 게시글을 수정하면 에러를 던진다", async () => {
      const repo = createArticleRepoMock([]);
      await expect(repo.updateArticle(999, { title: "수정" })).rejects.toThrow(
        "Article not found",
      );
    });
    test("제목만 수정할 수 있다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const updated = await repo.updateArticle(1, { title: "새 제목" });
      expect(updated.title).toBe("새 제목");
      expect(updated.content).toBe("기존 내용");
    });
    test("내용만 수정할 수 있다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const updated = await repo.updateArticle(1, { content: "새 내용" });
      expect(updated.title).toBe("기존 제목");
      expect(updated.content).toBe("새 내용");
    });
    test("updatedAt이 수정 시점으로 갱신된다", async () => {
      const originalTime = new Date("2026-07-01");
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: originalTime,
          updatedAt: originalTime,
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const beforeUpdate = new Date();
      const updated = await repo.updateArticle(1, { title: "새 제목" });
      const afterUpdate = new Date();
      expect(updated.createdAt.getTime()).toBe(originalTime.getTime());
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
      expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(
        afterUpdate.getTime(),
      );
    });
    test("빈 문자열로 수정할 수 있다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const updated = await repo.updateArticle(1, { title: "" });
      expect(updated.title).toBe("");
    });
  });
  describe("deleteArticle", () => {
    test("게시글을 삭제한다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "삭제될 게시글",
          content: "삭제될 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      const deleted = await repo.deleteArticle(1);
      expect(deleted.id).toBe(1);
      // 삭제 확인
      const notFound = await repo.findById(1);
      expect(notFound).toBeNull();
    });
    test("존재하지 않는 게시글을 삭제하면 에러를 던진다", async () => {
      const repo = createArticleRepoMock([]);
      await expect(repo.deleteArticle(999)).rejects.toThrow(
        "Article not found",
      );
    });
    test("여러 게시글 중 하나만 삭제하면 나머지는 유지된다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "첫 번째",
          content: "내용 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "두 번째",
          content: "내용 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userId: 1,
          title: "세 번째",
          content: "내용 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      await repo.deleteArticle(2);
      const remaining = await repo.findAll();
      expect(remaining.length).toBe(2);
      expect(remaining.map((a) => a.id)).not.toContain(2);
      expect(remaining.map((a) => a.id)).toEqual(
        expect.arrayContaining([1, 3]),
      );
    });
    test("음수 ID를 삭제하면 에러를 던진다", async () => {
      const repo = createArticleRepoMock([]);
      await expect(repo.deleteArticle(-1)).rejects.toThrow("Article not found");
    });
  });
  describe("initialArticles와의 격리", () => {
    test("initialArticles의 원본 배열을 수정해도 mock에 영향을 주지 않는다", async () => {
      const initialArticles = [
        {
          id: 1,
          userId: 1,
          title: "첫 번째",
          content: "내용 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const repo = createArticleRepoMock(initialArticles);
      initialArticles.push({
        id: 2,
        userId: 1,
        title: "추가된 게시글",
        content: "내용 2",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const articles = await repo.findAll();
      expect(articles.length).toBe(1);
      expect(articles[0].id).toBe(1);
    });
    test("undefined를 전달하면 빈 배열로 시작한다", async () => {
      const repo = createArticleRepoMock(undefined);
      const articles = await repo.findAll();
      expect(articles).toEqual([]);
    });
  });
});
