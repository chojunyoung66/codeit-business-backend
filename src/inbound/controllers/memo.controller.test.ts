import { jest, describe, test, expect } from "@jest/globals";
import request from "supertest";
import express from "express";
import { createArticleRepoMock } from "../../application/contracts/__mocks__/article.repo.mock.js";
import { createArticleService } from "../../application/services/article.service.js";
import { ArticleServiceError } from "../../application/contracts/article.service.interface.js";
import { Router } from "express";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../schemas/article.schema.js";

// 실제 memo.controller와 동일한 구현으로 테스트용 라우터 생성
const createTestApp = (
  articleService?: ReturnType<typeof createArticleService>,
) => {
  const app = express();
  app.use(express.json());

  // 기본 서비스 또는 테스트용 서비스 주입
  if (!articleService) {
    const mockRepo = createArticleRepoMock([]);
    articleService = createArticleService(mockRepo);
  }

  const {
    getArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
  } = articleService;

  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const articles = await getArticles();
      return res.json({ articles });
    } catch (error) {
      throw error;
    }
  });

  router.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }

    try {
      const article = await getArticleById(parsedId);
      return res.json({ article });
    } catch (error) {
      if (error instanceof ArticleServiceError) {
        return res.status(404).json({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  });

  router.post("/", async (req, res) => {
    const parsedBody = createArticleSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
        errors: parsedBody.error.issues,
      });
    }

    try {
      const article = await createArticle(parsedBody.data);
      return res.status(201).json({ article });
    } catch (error) {
      if (error instanceof ArticleServiceError) {
        return res.status(400).json({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  });

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }

    const parsedBody = updateArticleSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
        errors: parsedBody.error.issues,
      });
    }

    try {
      const article = await updateArticle({ id: parsedId, ...parsedBody.data });
      return res.json({ article });
    } catch (error) {
      if (error instanceof ArticleServiceError) {
        return res.status(404).json({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  });

  router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string") {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }
    const parsedId = parseInt(id, 10);

    if (isNaN(parsedId)) {
      return res.status(400).json({
        message: "요청 값이 올바르지 않습니다.",
      });
    }

    try {
      await deleteArticle(parsedId);
      return res.status(204).send();
    } catch (error) {
      if (error instanceof ArticleServiceError) {
        return res.status(404).json({
          message: error.message,
          code: error.code,
        });
      }
      throw error;
    }
  });

  app.use("/", router);
  return app;
};

describe("게시글 컨트롤러 테스트", () => {
  describe("GET /", () => {
    test("모든 게시글을 조회한다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "테스트 게시글",
          content: "테스트 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body.articles).toBeDefined();
      expect(res.body.articles.length).toBe(1);
      expect(res.body.articles[0].title).toBe("테스트 게시글");
    });

    test("게시글이 없으면 빈 배열을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body.articles).toEqual([]);
    });
  });

  describe("GET /:id", () => {
    test("게시글을 ID로 조회한다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "조회 테스트",
          content: "조회 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).get("/1");

      expect(res.status).toBe(200);
      expect(res.body.article).toBeDefined();
      expect(res.body.article.id).toBe(1);
      expect(res.body.article.title).toBe("조회 테스트");
    });

    test("존재하지 않는 게시글을 조회하면 404를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/999");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("게시글을 찾을 수 없습니다");
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("유효하지 않은 ID를 조회하면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/invalid");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });
  });

  describe("POST /", () => {
    test("새로운 게시글을 생성한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "새 게시글",
        content: "새 내용",
      });

      expect(res.status).toBe(201);
      expect(res.body.article).toBeDefined();
      expect(res.body.article.title).toBe("새 게시글");
      expect(res.body.article.content).toBe("새 내용");
    });

    test("필수 필드가 없으면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "제목만 있음",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });

    test("userId가 없으면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        title: "제목",
        content: "내용",
      });

      expect(res.status).toBe(400);
    });

    test("title이 없으면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        content: "내용",
      });

      expect(res.status).toBe(400);
    });

    test("content가 없으면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "제목",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /:id", () => {
    test("게시글을 수정한다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).put("/1").send({
        title: "수정된 제목",
        content: "수정된 내용",
      });

      expect(res.status).toBe(200);
      expect(res.body.article).toBeDefined();
      expect(res.body.article.title).toBe("수정된 제목");
    });

    test("존재하지 않는 게시글을 수정하면 404를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/999").send({
        title: "수정",
      });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("유효하지 않은 ID를 수정하면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/invalid").send({
        title: "수정",
      });

      expect(res.status).toBe(400);
    });

    test("제목만 수정할 수 있다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).put("/1").send({
        title: "새 제목",
      });

      expect(res.status).toBe(200);
      expect(res.body.article.title).toBe("새 제목");
    });
  });

  describe("DELETE /:id", () => {
    test("게시글을 삭제한다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "삭제할 게시글",
          content: "삭제할 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).delete("/1");

      expect(res.status).toBe(204);
    });

    test("존재하지 않는 게시글을 삭제하면 404를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).delete("/999");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("유효하지 않은 ID를 삭제하면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).delete("/invalid");

      expect(res.status).toBe(400);
    });
  });

  describe("엣지 케이스 - ID 경계값", () => {
    test("GET /:id - 음수 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/-1");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("GET /:id - 0 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/0");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("GET /:id - 부동소수점 문자열 ID는 정수로 파싱되어 처리된다", async () => {
      const app = createTestApp();
      const res = await request(app).get("/123.45");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("PUT /:id - 음수 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/-1").send({
        title: "제목",
      });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("PUT /:id - 0 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/0").send({
        title: "제목",
      });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("DELETE /:id - 음수 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).delete("/-1");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });

    test("DELETE /:id - 0 ID는 parseInt를 통과하지만 NOT_FOUND를 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).delete("/0");

      expect(res.status).toBe(404);
      expect(res.body.code).toBe("ARTICLE_NOT_FOUND");
    });
  });

  describe("엣지 케이스 - POST Zod 스키마 검증", () => {
    test("title이 빈 문자열이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "",
        content: "내용",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
      expect(res.body.errors).toBeDefined();
    });

    test("content가 빈 문자열이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "제목",
        content: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
      expect(res.body.errors).toBeDefined();
    });

    test("userId가 문자열이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: "문자열",
        title: "제목",
        content: "내용",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
      expect(res.body.errors).toBeDefined();
    });

    test("userId가 null이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: null,
        title: "제목",
        content: "내용",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });

    test("title이 null이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: null,
        content: "내용",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });

    test("content가 null이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).post("/").send({
        userId: 1,
        title: "제목",
        content: null,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });
  });

  describe("엣지 케이스 - PUT Zod 스키마 검증", () => {
    test("title이 빈 문자열이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/1").send({
        title: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
      expect(res.body.errors).toBeDefined();
    });

    test("content가 빈 문자열이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/1").send({
        content: "",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
      expect(res.body.errors).toBeDefined();
    });

    test("수정할 필드가 없는 경우 (빈 객체)는 통과한다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).put("/1").send({});

      expect(res.status).toBe(200);
    });

    test("content만 수정할 수 있다", async () => {
      const mockRepo = createArticleRepoMock([
        {
          id: 1,
          userId: 1,
          title: "기존 제목",
          content: "기존 내용",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as any);
      const service = createArticleService(mockRepo);
      const app = createTestApp(service);

      const res = await request(app).put("/1").send({
        content: "새 내용",
      });

      expect(res.status).toBe(200);
      expect(res.body.article).toBeDefined();
    });

    test("title이 null이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/1").send({
        title: null,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });

    test("content가 null이면 400을 반환한다", async () => {
      const app = createTestApp();
      const res = await request(app).put("/1").send({
        content: null,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("요청 값이 올바르지 않습니다.");
    });
  });
});
