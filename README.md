# outbound-sdk

Official Node.js SDK for the [Outbound](https://github.com/AdarshChakrworty/outbound) email platform.

## Install

```bash
npm install outbound-sdk
```

## Quick Start

```ts
import { Outbound } from 'outbound-sdk';

const outbound = new Outbound({
  baseUrl: 'https://api.your-domain.com', // optional, defaults to production
});

const apiKey = 'mu_outbound_...'; // your tenant API key
```

Every method requires an `apiKey` as the first argument, allowing you to use multiple tenants with a single client instance.

### Send an Email

```ts
const { jobId, messageId } = await outbound.email.send(apiKey, {
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Welcome!',
  htmlBody: '<h1>Hello World</h1>',
});
```

### Send Bulk Emails

```ts
const result = await outbound.email.bulk(apiKey, {
  fromEmail: 'noreply@company.com',
  emailSubject: 'Newsletter',
  emails: [
    { toEmail: 'alice@example.com', htmlBody: '<h1>Hi Alice</h1>' },
    { toEmail: 'bob@example.com', htmlBody: '<h1>Hi Bob</h1>' },
  ],
});
// result.recipientCount, result.jobId
```

### Check Job Status

```ts
const status = await outbound.email.status(apiKey, 'job-uuid');
// status.job, status.recipients
```

### Templates

```ts
// Create
const { template } = await outbound.templates.create(apiKey, {
  name: 'welcome',
  subject: 'Welcome {{firstName}}!',
  htmlBody: '<h1>Hello {{firstName}}</h1>',
  variables: ['firstName'],
});

// List
const { templates, total } = await outbound.templates.list(apiKey, { status: 'active' });

// Send using template
const { jobId } = await outbound.templates.send(apiKey, {
  templateId: template.id,
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  variables: { firstName: 'John' },
});

// Bulk send using template
const bulk = await outbound.templates.bulkSend(apiKey, {
  templateId: template.id,
  fromEmail: 'noreply@company.com',
  recipients: [
    { toEmail: 'alice@example.com', variables: { firstName: 'Alice' } },
    { toEmail: 'bob@example.com', variables: { firstName: 'Bob' } },
  ],
});

// Preview
const preview = await outbound.templates.preview(apiKey, template.id, {
  variables: { firstName: 'John' },
});
```

### Suppressions

```ts
// Add
await outbound.suppressions.add(apiKey, { email: 'bad@example.com', reason: 'manual' });

// List
const { suppressions } = await outbound.suppressions.list(apiKey, { reason: 'bounce' });

// Remove
await outbound.suppressions.remove(apiKey, 'bad@example.com');
```

### Webhooks

```ts
// Create
const { webhook, secret } = await outbound.webhooks.create(apiKey, {
  url: 'https://myapp.com/webhooks/outbound',
  events: ['delivery', 'bounce', 'complaint'],
});
// Store `secret` securely for signature verification

// Verify incoming webhook
const isValid = Outbound.verifyWebhookSignature(rawBody, signatureHeader, secret);
```

### Dashboard

```ts
const dashboard = await outbound.dashboard.get(apiKey);
// dashboard.last30Days.sent, dashboard.quota, etc.

const quota = await outbound.dashboard.quota(apiKey);
// quota.dailyUsed, quota.monthlyUsed, quota.remaining
```

### Multi-Tenant Usage

```ts
const outbound = new Outbound();

const tenantAKey = 'mu_outbound_tenant_a_...';
const tenantBKey = 'mu_outbound_tenant_b_...';

// Use different API keys for different tenants
await outbound.email.send(tenantAKey, { ... });
await outbound.email.send(tenantBKey, { ... });
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `https://outbound-api.mastersunion.org` | API base URL |
| `timeout` | `30000` | Request timeout in ms |
| `maxRetries` | `3` | Max retries on 429/5xx |
| `retryDelay` | `1000` | Initial retry delay in ms (exponential backoff) |

## Error Handling

All errors extend `OutboundError` with `statusCode`, `message`, and `details`:

```ts
import { Outbound, RateLimitError, NotFoundError } from 'outbound-sdk';

try {
  await outbound.email.send(apiKey, { ... });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof NotFoundError) {
    console.log('Resource not found');
  }
}
```

| Error Class | Status Code |
|------------|-------------|
| `BadRequestError` | 400 |
| `AuthenticationError` | 401 |
| `ForbiddenError` | 403 |
| `NotFoundError` | 404 |
| `ConflictError` | 409 |
| `RateLimitError` | 429 |
| `ServerError` | 5xx |
| `TimeoutError` | - |
| `NetworkError` | - |

## Requirements

- Node.js 18+ (uses native `fetch`)

## License

MIT
