import type { TechnicalErrorCode } from "./technical-error.enum.js";

export class TechnicalException extends Error {
  originalError?: unknown;

  constructor(
    message: string,
    public code: TechnicalErrorCode,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "TechnicalException";
    this.originalError = originalError;
  }
}
