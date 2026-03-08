export class OutboundError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'OutboundError';
  }
}

export class BadRequestError extends OutboundError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 400, details, requestId);
    this.name = 'BadRequestError';
  }
}

export class AuthenticationError extends OutboundError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 401, details, requestId);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends OutboundError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 403, details, requestId);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends OutboundError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 404, details, requestId);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends OutboundError {
  constructor(message: string, details?: unknown, requestId?: string) {
    super(message, 409, details, requestId);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends OutboundError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, details?: unknown, requestId?: string) {
    super(message, 429, details, requestId);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends OutboundError {
  constructor(message: string, statusCode: number = 500, details?: unknown, requestId?: string) {
    super(message, statusCode, details, requestId);
    this.name = 'ServerError';
  }
}

export class TimeoutError extends OutboundError {
  constructor(message: string = 'Request timed out') {
    super(message, 0);
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends OutboundError {
  constructor(message: string = 'Network request failed') {
    super(message, 0);
    this.name = 'NetworkError';
  }
}
