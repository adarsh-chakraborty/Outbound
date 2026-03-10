# Configuration

## Default Behavior

The SDK client is stateless — no API key is stored. Create a client with optional config:

```ts
const outbound = new Outbound(); // That's it!
```

Every method takes the API key as its first argument, allowing multi-tenant usage with a single client.

## Constructor Options

You can customize HTTP behavior by passing a config object:

```ts
const outbound = new Outbound({
  baseUrl: 'http://localhost:3000', // For local development
  timeout: 30_000,    // Request timeout in ms (default: 30s)
  maxRetries: 3,      // Retry attempts on 429/5xx (default: 3)
  retryDelay: 1000,   // Initial backoff delay in ms (default: 1s)
});
```

## Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | Production URL | API base URL (override for local dev) |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `maxRetries` | `number` | `3` | Max retry attempts on 429 and 5xx errors |
| `retryDelay` | `number` | `1000` | Initial retry delay in ms (doubles each attempt) |

## API Key

The API key is passed as the first argument to every method call:

```ts
const apiKey = 'mu_outbound_...';

await outbound.email.send(apiKey, { /* ... */ });
await outbound.templates.list(apiKey);
await outbound.dashboard.quota(apiKey);
```

This design supports multi-tenant applications where different requests use different API keys:

```ts
const tenantAKey = 'mu_outbound_tenant_a_...';
const tenantBKey = 'mu_outbound_tenant_b_...';

await outbound.email.send(tenantAKey, { /* ... */ });
await outbound.email.send(tenantBKey, { /* ... */ });
```

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
  baseUrl: 'http://localhost:3000',
});
```
