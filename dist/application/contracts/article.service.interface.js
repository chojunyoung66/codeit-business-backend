export class ArticleServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "ArticleServiceError";
    }
}
