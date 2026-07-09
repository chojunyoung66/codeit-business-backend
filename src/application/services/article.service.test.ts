import { describe, test, expect } from "@jest/globals";
import { createArticleService } from "./article.service.js";
import { createContentPolicy } from "../../domain/content-policy/content.policy.js";
import { createArticleRepoMock } from "../contracts/__mocks__/article.repo.mock.js";
import { createUserRepoMock } from "../contracts/__mocks__/user.repo.mock.js";
import type { Article, User } from "../../generated/prisma/client.js";

describe("게시글 서비스 테스트", () => {
  describe("getArticles", () => {
    test("모든 게시글을 조회한다", async () => {
      const fakeArticles = [
        {
          id: 1,
          userId: 1,
          title: "첫 번째 게시글",
          content: "내용 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "두 번째 게시글",
          content: "내용 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as unknown as Article[];

      const articleRepo = createArticleRepoMock(fakeArticles);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { getArticles } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const articles = await getArticles();

      expect(articles.length).toEqual(2);
    });

    test("게시글이 없으면 빈 배열을 반환한다", async () => {
      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { getArticles } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const articles = await getArticles();

      expect(articles).toEqual([]);
    });
  });

  describe("getArticleById", () => {
    test("ID로 게시글을 조회한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "테스트 게시글",
        content: "테스트 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Article;

      const articleRepo = createArticleRepoMock([fakeArticle]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { getArticleById } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const article = await getArticleById(1);

      expect(article.id).toEqual(1);
      expect(article.title).toEqual("테스트 게시글");
    });

    test("게시글이 없으면 에러를 던진다", async () => {
      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { getArticleById } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(getArticleById(999)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
    });
  });

  describe("createArticle", () => {
    test("새로운 게시글을 생성한다", async () => {
      const fakeUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock([fakeUser]);
      const contentPolicy = createContentPolicy();

      const { createArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const article = await createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });

      expect(article.title).toEqual("새 게시글");
      expect(article.content).toEqual("새 내용");
      expect(article.userId).toEqual(1);
    });

    test("사용자가 존재하지 않으면 에러를 던진다", async () => {
      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock([]);
      const contentPolicy = createContentPolicy();

      const { createArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(
        createArticle({
          userId: 999,
          title: "새 게시글",
          content: "새 내용",
        }),
      ).rejects.toThrow("사용자를 찾을 수 없습니다");
    });

    test("제목에 금칙어가 포함되면 에러를 던진다", async () => {
      const fakeUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock([fakeUser]);
      const contentPolicy = createContentPolicy();

      const { createArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(
        createArticle({
          userId: 1,
          title: "이건 욕설이다",
          content: "새 내용",
        }),
      ).rejects.toThrow("부적절한 단어가 포함되어 있습니다");
    });

    test("내용에 금칙어가 포함되면 에러를 던진다", async () => {
      const fakeUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        username: "testuser",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as User;

      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock([fakeUser]);
      const contentPolicy = createContentPolicy();

      const { createArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(
        createArticle({
          userId: 1,
          title: "새 게시글",
          content: "이건 스팸입니다",
        }),
      ).rejects.toThrow("부적절한 단어가 포함되어 있습니다");
    });
  });

  describe("updateArticle", () => {
    test("게시글이 없으면 에러를 던진다", async () => {
      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { updateArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(
        updateArticle({ id: 999, title: "수정된 제목" }),
      ).rejects.toThrow("게시글을 찾을 수 없습니다");
    });

    test("제목만 제공하면 업데이트된 article을 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "기존 제목",
        content: "기존 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Article;

      const articleRepo = createArticleRepoMock([fakeArticle]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { updateArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const result = await updateArticle({ id: 1, title: "수정된 제목" });

      expect(result.title).toEqual("수정된 제목");
      expect(result.content).toEqual("기존 내용");
    });

    test("내용만 제공하면 업데이트된 article을 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "기존 제목",
        content: "기존 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Article;

      const articleRepo = createArticleRepoMock([fakeArticle]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { updateArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );
      const result = await updateArticle({ id: 1, content: "수정된 내용" });

      expect(result.title).toEqual("기존 제목");
      expect(result.content).toEqual("수정된 내용");
    });
  });

  describe("deleteArticle", () => {
    test("게시글이 없으면 에러를 던진다", async () => {
      const articleRepo = createArticleRepoMock([]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { deleteArticle } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await expect(deleteArticle(999)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
    });

    test("정상적으로 게시글을 삭제한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "삭제할 게시글",
        content: "삭제할 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Article;

      const articleRepo = createArticleRepoMock([fakeArticle]);
      const userRepo = createUserRepoMock();
      const contentPolicy = createContentPolicy();

      const { deleteArticle, getArticles } = createArticleService(
        articleRepo,
        userRepo,
        contentPolicy,
      );

      await deleteArticle(1);
      const articles = await getArticles();

      expect(articles.length).toEqual(0);
    });
  });
});
