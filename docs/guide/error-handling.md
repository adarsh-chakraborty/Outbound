# Error Handling

## Error Classes

All errors thrown by the SDK extend `OutboundError`. Each error has:

- `message` — Human-readable error message
- `statusCode` — HTTP status code (0 for network/timeout errors)
- `details` — Additional error details from the API (if any)
- `requestId` — Request ID for debugging (if returned by the API)

```ts
import { Outbound, OutboundError, RateLimitError } from '@masters-union/outbound-sdk';

try {
  await outbound.email.send(apiKey, { ... });
} catch (err) {
  if (err instanceof OutboundError) {
    console.error(`Error ${err.statusCode}: ${err.message}`);
    console.error('Details:', err.details);
  }
}
```

## Error Types

| Class | Status | When |
|-------|--------|------|
| `BadRequestError` | 400 | Invalid parameters, missing required fields |
| `AuthenticationError` | 401 | Invalid or missing API key |
| `ForbiddenError` | 403 | Account disabled, tenant suspended |
| `NotFoundError` | 404 | Resource not found (job, template, webhook) |
| `ConflictError` | 409 | Duplicate resource (e.g., email already suppressed) |
| `RateLimitError` | 429 | Too many requests (auto-retried by default) |
| `ServerError` | 5xx | Server-side error (auto-retried by default) |
| `TimeoutError` | — | Request exceeded timeout |
| `NetworkError` | — | Network connectivity failure |

## Catching Specific Errors

```ts
import {
  BadRequestError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from '@masters-union/outbound-sdk';

try {
  await outbound.email.send(apiKey, params);
} catch (err) {
  if (err instanceof BadRequestError) {
    // Fix your request parameters
    console.error('Bad request:', err.message);
  } else if (err instanceof AuthenticationError) {
    // Check your API key
    console.error('Auth failed:', err.message);
  } else if (err instanceof NotFoundError) {
    // Resource doesn't exist
    console.error('Not found:', err.message);
  } else if (err instanceof RateLimitError) {
    // Only thrown after all retries exhausted
    console.error(`Rate limited. Retry after: ${err.retryAfter}s`);
  }
}
```

## Rate Limit Errors

`RateLimitError` has an additional `retryAfter` property (in seconds):

```ts
try {
  await outbound.email.bulk(apiKey, { ... });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Retry after ${err.retryAfter} seconds`);
    // Note: The SDK already retried 3 times before throwing this.
    // This error means all retries were exhausted.
  }
}
```

::: tip
By default, the SDK retries 429 errors 3 times with exponential backoff. You only see a `RateLimitError` if all retries fail. Adjust with `maxRetries` in the constructor.
:::
