export class MailvexError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
    public readonly requestId?: string,
    public readonly details?: unknown[]
  ) {
    super(message);
    this.name = "MailvexError";
  }
}

export class AuthenticationError extends MailvexError {
  constructor(message: string, code: string, requestId?: string) {
    super(message, code, 401, requestId);
    this.name = "AuthenticationError";
  }
}

export class PermissionError extends MailvexError {
  constructor(message: string, code: string, requestId?: string) {
    super(message, code, 403, requestId);
    this.name = "PermissionError";
  }
}

export class NotFoundError extends MailvexError {
  constructor(message: string, code: string, requestId?: string) {
    super(message, code, 404, requestId);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends MailvexError {
  constructor(message: string, code: string, requestId?: string) {
    super(message, code, 409, requestId);
    this.name = "ConflictError";
  }
}

export class ValidationError extends MailvexError {
  constructor(
    message: string,
    code: string,
    details?: unknown[],
    requestId?: string
  ) {
    super(message, code, 400, requestId, details);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends MailvexError {
  constructor(
    message: string,
    public readonly retryAfter?: number,
    requestId?: string
  ) {
    super(message, "RATE_LIMITED", 429, requestId);
    this.name = "RateLimitError";
  }
}

export class InternalError extends MailvexError {
  constructor(message: string, code: string, requestId?: string) {
    super(message, code, 500, requestId);
    this.name = "InternalError";
  }
}

export function createError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown[],
  requestId?: string,
  retryAfter?: number
): MailvexError {
  switch (statusCode) {
    case 400:
      return new ValidationError(message, code, details, requestId);
    case 401:
      return new AuthenticationError(message, code, requestId);
    case 403:
      return new PermissionError(message, code, requestId);
    case 404:
      return new NotFoundError(message, code, requestId);
    case 409:
      return new ConflictError(message, code, requestId);
    case 429:
      return new RateLimitError(message, retryAfter, requestId);
    default:
      return new MailvexError(message, code, statusCode, requestId, details);
  }
}
