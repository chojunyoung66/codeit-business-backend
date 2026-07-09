export class AuthServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = "AuthServiceError";
    }
}
