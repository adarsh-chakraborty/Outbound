# Configuration

## Default Behavior

Set your API key in the constructor and all methods use it automatically:

```ts
const outbound = new Outbound({ apiKey: 'mu_outbound_...' });
```

## Constructor Options

You can customize HTTP behavior by passing a config object:

```ts
const outbound = new Outbound({
  apiKey: 'mu_outbound_...',      // Default API key (optional if provided per call)
  baseUrl: 'http://localhost:3000', // For local development
  timeout: 30_000,    // Request timeout in ms (default: 30s)
  maxRetries: 3,      // Retry attempts on 429/5xx (default: 3)
  retryDelay: 1000,   // Initial backoff delay in ms (default: 1s)
});
```

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | Default API key (optional if provided per call) |
| `baseUrl` | `string` | Production URL | API base URL (override for local dev) |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | `3` | Max retry attempts on 429 and 5xx errors |
| `retryDelay` | `number` | `1000` | Initial retry delay in ms (doubles each attempt) |

## API Key

The API key can be set in two places:

1. **Constructor (default)** — used for all calls unless overridden
2. **Per call** — passed as the last argument via `{ apiKey }`, takes priority

### Single tenant — set once

```ts
const outbound = new Outbound({ apiKey: 'mu_outbound_...' });

await outbound.email.send({ /* ... */ });          // uses constructor key
await outbound.dashboard.quota();                  // uses constructor key
```

### Multi-tenant — override per call

```ts
const outbound = new Outbound(); // no default key

await outbound.email.send({ /* ... */ }, { apiKey: tenantAKey });
await outbound.email.send({ /* ... */ }, { apiKey: tenantBKey });
```

### Mixed — default with overrides

```ts
const outbound = new Outbound({ apiKey: tenantAKey });

await outbound.email.send({ /* ... */ });                        // uses tenantAKey
await outbound.email.send({ /* ... */ }, { apiKey: tenantBKey }); // uses tenantBKey
```

If no API key is available (neither in the constructor nor per call), an `AuthenticationError` is thrown.

### Getting your API key

1. Log in to the Outbound dashboard
2. Navigate to **Settings > API Keys**
3. Generate a new key — it starts with `mu_outbound_`

::: warning
Keep your API key secret. Never commit it to version control. Use environment variables or a secrets manager.
:::

## Retry Behavior

The SDK automatically retries failed requests with exponential backoff:

- **Retried:** `429 Too Many Requests` and `5xx Server Error`
- **Not retried:** `4xx Client Errors` (400, 401, 403, 404, 409)
- **Backoff:** 1s → 2s → 4s (doubles each attempt)
- **429 with Retry-After:** Respects the server's `Retry-After` header

```ts
// Disable retries
const outbound = new Outbound({ maxRetries: 0 });

// Aggressive retries
const outbound = new Outbound({ maxRetries: 5, retryDelay: 500 });
```

## Local Development

When developing against a local Outbound API instance:

```ts
const outbound = new Outbound({
  apiKey: 'mu_outbound_...',
  baseUrl: 'http://localhost:3000',
});
```
