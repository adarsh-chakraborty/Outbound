import type { ResolvedConfig } from './types';
import {
  OutboundError,
  BadRequestError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  TimeoutError,
  NetworkError,
} from './errors';

export interface RequestOptions {
  body?: unknown;
  params?: Record<string, unknown>;
}

export class HttpClient {
  constructor(private config: ResolvedConfig) {}

  async get<T>(path: string, params?: Record<string, unknown>, apiKey?: string): Promise<T> {
    return this.request<T>('GET', path, { params }, apiKey);
  }

  async post<T>(path: string, body?: unknown, apiKey?: string): Promise<T> {
    return this.request<T>('POST', path, { body }, apiKey);
  }

  async patch<T>(path: string, body?: unknown, apiKey?: string): Promise<T> {
    return this.request<T>('PATCH', path, { body }, apiKey);
  }

  async delete<T>(path: string, apiKey?: string): Promise<T> {
    return this.request<T>('DELETE', path, undefined, apiKey);
  }

  private resolveApiKey(apiKey?: string): string {
    const key = apiKey || this.config.apiKey;
    if (!key) {
      throw new AuthenticationError(
        'API key is required. Pass it to the constructor or provide it per method call.',
      );
    }
    return key;
  }

  private async request<T>(method: string, path: string, options?: RequestOptions, apiKey?: string): Promise<T> {
    const resolvedKey = this.resolveApiKey(apiKey);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const url = this.buildUrl(path, options?.params);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          method,
          headers: {
            'X-Api-Key': resolvedKey,
            'Content-Type': 'application/json',
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return (await response.json()) as T;
        }

        const error = await this.parseError(response);

        // Only retry on 429 and 5xx
        if (response.status === 429 || response.status >= 500) {
          lastError = error;

          if (attempt < this.config.maxRetries) {
            const retryAfter = error instanceof RateLimitError && error.retryAfter
              ? error.retryAfter * 1000
              : this.config.retryDelay * Math.pow(2, attempt);

            await this.sleep(retryAfter);
            continue;
          }
        }

        throw error;
      } catch (err) {
        if (err instanceof OutboundError) {
          // Already a typed error from parseError — check if retryable
          if ((err.statusCode === 429 || err.statusCode >= 500) && attempt < this.config.maxRetries) {
            lastError = err;
            const retryAfter = err instanceof RateLimitError && err.retryAfter
              ? err.retryAfter * 1000
              : this.config.retryDelay * Math.pow(2, attempt);
            await this.sleep(retryAfter);
            continue;
          }
          throw err;
        }

        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new TimeoutError(`Request timed out after ${this.config.timeout}ms`);
          if (attempt < this.config.maxRetries) {
            await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
            continue;
          }
          throw lastError;
        }

        lastError = new NetworkError((err as Error).message);
        if (attempt < this.config.maxRetries) {
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError || new NetworkError('Request failed after retries');
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const base = this.config.baseUrl.replace(/\/+$/, '');
    const url = new URL(`${base}${path}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async parseError(response: Response): Promise<OutboundError> {
    let body: { error?: string; message?: string; details?: unknown } = {};
    const requestId = response.headers.get('x-request-id') || undefined;

    try {
      body = (await response.json()) as typeof body;
    } catch {
      // Response may not be JSON
    }

    const message = body.error || body.message || `HTTP ${response.status}`;
    const details = body.details;

    switch (response.status) {
      case 400:
        return new BadRequestError(message, details, requestId);
      case 401:
        return new AuthenticationError(message, details, requestId);
      case 403:
        return new ForbiddenError(message, details, requestId);
      case 404:
        return new NotFoundError(message, details, requestId);
      case 409:
        return new ConflictError(message, details, requestId);
      case 429: {
        const retryAfter = response.headers.get('retry-after');
        return new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter, 10) : undefined,
          details,
          requestId,
        );
      }
      default:
        if (response.status >= 500) {
          return new ServerError(message, response.status, details, requestId);
        }
        return new OutboundError(message, response.status, details, requestId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
