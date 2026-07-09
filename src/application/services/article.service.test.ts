import { jest, describe, test, expect } from "@jest/globals";
import { createArticleService } from "./article.service.js";
import type { Article } from "../../generated/prisma/client.js";
import type { ArticleRepo } from "../contracts/article.repo.interface.js";

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
      ];

      const fakeArticleRepo = {
        findAll: jest
          .fn<() => Promise<Article[]>>()
          .mockResolvedValue(fakeArticles as Article[]),
        findById: jest.fn(),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticles } = createArticleService(fakeArticleRepo);
      const articles = await getArticles();

      expect(articles).toEqual(fakeArticles);
      expect(fakeArticleRepo.findAll).toHaveBeenCalled();
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
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(fakeArticle as Article),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticleById } = createArticleService(fakeArticleRepo);
      const article = await getArticleById(1);

      expect(article).toEqual(fakeArticle);
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(1);
    });

    test("게시글이 없으면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticleById } = createArticleService(fakeArticleRepo);

      await expect(getArticleById(999)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
    });
  });

  describe("createArticle", () => {
    test("새로운 게시글을 생성한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest.fn(),
        createArticle: jest
          .fn<
            (data: {
              userId: number;
              title: string;
              content: string;
            }) => Promise<Article>
          >()
          .mockResolvedValue(fakeArticle as Article),
      } as unknown as ArticleRepo;

      const { createArticle } = createArticleService(fakeArticleRepo);
      const article = await createArticle({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });

      expect(article).toEqual(fakeArticle);
      expect(fakeArticleRepo.createArticle).toHaveBeenCalledWith({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });
    });

    test("DB 에러 발생 시 에러를 전파한다", async () => {
      const dbError = new Error("Database connection failed");

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest.fn(),
        createArticle: jest
          .fn<
            (data: {
              userId: number;
              title: string;
              content: string;
            }) => Promise<Article>
          >()
          .mockRejectedValue(dbError),
      } as unknown as ArticleRepo;

      const { createArticle } = createArticleService(fakeArticleRepo);

      await expect(
        createArticle({
          userId: 1,
          title: "새 게시글",
          content: "새 내용",
        }),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getArticles", () => {
    test("게시글이 없으면 빈 배열을 반환한다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn<() => Promise<Article[]>>().mockResolvedValue([]),
        findById: jest.fn(),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticles } = createArticleService(fakeArticleRepo);
      const articles = await getArticles();

      expect(articles).toEqual([]);
      expect(fakeArticleRepo.findAll).toHaveBeenCalled();
    });

    test("DB 에러 발생 시 에러를 전파한다", async () => {
      const dbError = new Error("Database connection failed");

      const fakeArticleRepo = {
        findAll: jest.fn<() => Promise<Article[]>>().mockRejectedValue(dbError),
        findById: jest.fn(),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticles } = createArticleService(fakeArticleRepo);

      await expect(getArticles()).rejects.toThrow("Database connection failed");
    });
  });

  describe("getArticleById - 추가 엣지 케이스", () => {
    test("음수 ID로 조회하면 게시글이 없음 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticleById } = createArticleService(fakeArticleRepo);

      await expect(getArticleById(-1)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(-1);
    });

    test("0 ID로 조회하면 게시글이 없음 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticleById } = createArticleService(fakeArticleRepo);

      await expect(getArticleById(0)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(0);
    });

    test("DB 에러 발생 시 에러를 전파한다", async () => {
      const dbError = new Error("Database connection failed");

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockRejectedValue(dbError),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { getArticleById } = createArticleService(fakeArticleRepo);

      await expect(getArticleById(1)).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("updateArticle", () => {
    test("게시글 업데이트 - id가 존재하지 않으면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);

      await expect(
        updateArticle({ id: 999, title: "수정된 제목" }),
      ).rejects.toThrow("게시글을 찾을 수 없습니다");
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(999);
    });

    test("게시글 업데이트 - 음수 ID로 조회하면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);

      await expect(
        updateArticle({ id: -1, title: "수정된 제목" }),
      ).rejects.toThrow("게시글을 찾을 수 없습니다");
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(-1);
    });

    test("게시글 업데이트 - title만 제공하면 기존 article을 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "기존 제목",
        content: "기존 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(fakeArticle as Article),
        createArticle: jest.fn(),
        updateArticle: jest
          .fn<(id: number, data: any) => Promise<Article>>()
          .mockResolvedValue(fakeArticle as Article),
        deleteArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);
      const result = await updateArticle({ id: 1, title: "수정된 제목" });

      expect(result).toEqual(fakeArticle);
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(1);
    });

    test("게시글 업데이트 - content만 제공하면 기존 article을 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "기존 제목",
        content: "기존 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(fakeArticle as Article),
        createArticle: jest.fn(),
        updateArticle: jest
          .fn<(id: number, data: any) => Promise<Article>>()
          .mockResolvedValue(fakeArticle as Article),
        deleteArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);
      const result = await updateArticle({ id: 1, content: "수정된 내용" });

      expect(result).toEqual(fakeArticle);
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(1);
    });

    test("게시글 업데이트 - title과 content 모두 제공하면 기존 article을 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "기존 제목",
        content: "기존 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(fakeArticle as Article),
        createArticle: jest.fn(),
        updateArticle: jest
          .fn<(id: number, data: any) => Promise<Article>>()
          .mockResolvedValue(fakeArticle as Article),
        deleteArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);
      const result = await updateArticle({
        id: 1,
        title: "수정된 제목",
        content: "수정된 내용",
      });

      expect(result).toEqual(fakeArticle);
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(1);
    });

    test("게시글 업데이트 - DB 에러 발생 시 에러를 전파한다", async () => {
      const dbError = new Error("Database connection failed");

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockRejectedValue(dbError),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { updateArticle } = createArticleService(fakeArticleRepo);

      await expect(
        updateArticle({ id: 1, title: "수정된 제목" }),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("deleteArticle", () => {
    test("게시글 삭제 - id가 존재하지 않으면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { deleteArticle } = createArticleService(fakeArticleRepo);

      await expect(deleteArticle(999)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(999);
    });

    test("게시글 삭제 - 음수 ID로 조회하면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { deleteArticle } = createArticleService(fakeArticleRepo);

      await expect(deleteArticle(-1)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(-1);
    });

    test("게시글 삭제 - 0 ID로 조회하면 에러를 던진다", async () => {
      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(null),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { deleteArticle } = createArticleService(fakeArticleRepo);

      await expect(deleteArticle(0)).rejects.toThrow(
        "게시글을 찾을 수 없습니다",
      );
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(0);
    });

    test("게시글 삭제 - DB 에러 발생 시 에러를 전파한다", async () => {
      const dbError = new Error("Database connection failed");

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockRejectedValue(dbError),
        createArticle: jest.fn(),
      } as unknown as ArticleRepo;

      const { deleteArticle } = createArticleService(fakeArticleRepo);

      await expect(deleteArticle(1)).rejects.toThrow(
        "Database connection failed",
      );
    });

    test("게시글 삭제 - 정상 삭제 후 void를 반환한다", async () => {
      const fakeArticle = {
        id: 1,
        userId: 1,
        title: "삭제할 게시글",
        content: "삭제할 내용",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fakeArticleRepo = {
        findAll: jest.fn(),
        findById: jest
          .fn<(id: number) => Promise<Article | null>>()
          .mockResolvedValue(fakeArticle as Article),
        createArticle: jest.fn(),
        updateArticle: jest.fn(),
        deleteArticle: jest
          .fn<(id: number) => Promise<Article>>()
          .mockResolvedValue(fakeArticle as Article),
      } as unknown as ArticleRepo;

      const { deleteArticle } = createArticleService(fakeArticleRepo);
      const result = await deleteArticle(1);

      expect(result).toBeUndefined();
      expect(fakeArticleRepo.findById).toHaveBeenCalledWith(1);
    });
  });
});
