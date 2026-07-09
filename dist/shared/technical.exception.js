export class TechnicalException extends Error {
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.name = "TechnicalException";
        this.originalError = originalError;
    }
}
