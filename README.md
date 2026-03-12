# outbound-sdk

Official Node.js SDK for the [Outbound](https://github.com/AdarshChakrworty/outbound) email platform.

## Install

```bash
npm install outbound-sdk
```

## Quick Start

```ts
import { Outbound } from 'outbound-sdk';

// Single tenant — set API key once
const outbound = new Outbound({ apiKey: 'mu_outbound_...' });

const { jobId } = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Welcome!',
  htmlBody: '<h1>Hello World</h1>',
});
```

### Multi-Tenant Usage

For applications that manage multiple tenants, create one client and pass the API key per call:

```ts
const outbound = new Outbound(); // no default apiKey

const tenantAKey = 'mu_outbound_tenant_a_...';
const tenantBKey = 'mu_outbound_tenant_b_...';

await outbound.email.send({ toEmail: '...', ... }, { apiKey: tenantAKey });
await outbound.email.send({ toEmail: '...', ... }, { apiKey: tenantBKey });
```

A per-call `apiKey` always takes priority over the constructor default.

### Send Bulk Emails

```ts
const result = await outbound.email.bulk({
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
const status = await outbound.email.status('job-uuid');
// status.job, status.recipients
```

### Templates

```ts
// Create
const { template } = await outbound.templates.create({
  name: 'welcome',
  subject: 'Welcome {{firstName}}!',
  htmlBody: '<h1>Hello {{firstName}}</h1>',
  variables: ['firstName'],
});

// List
const { templates, total } = await outbound.templates.list({ status: 'active' });

// Send using template
const { jobId } = await outbound.templates.send({
  templateId: template.id,
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  variables: { firstName: 'John' },
});

// Bulk send using template
const bulk = await outbound.templates.bulkSend({
  templateId: template.id,
  fromEmail: 'noreply@company.com',
  recipients: [
    { toEmail: 'alice@example.com', variables: { firstName: 'Alice' } },
    { toEmail: 'bob@example.com', variables: { firstName: 'Bob' } },
  ],
});

// Preview
const preview = await outbound.templates.preview(template.id, {
  variables: { firstName: 'John' },
});
```

### Suppressions

```ts
// Add
await outbound.suppressions.add({ email: 'bad@example.com', reason: 'manual' });

// List
const { suppressions } = await outbound.suppressions.list({ reason: 'bounce' });

// Remove
await outbound.suppressions.remove('bad@example.com');
```

### Webhooks

```ts
// Create
const { webhook, secret } = await outbound.webhooks.create({
  url: 'https://myapp.com/webhooks/outbound',
  events: ['delivery', 'bounce', 'complaint'],
});
// Store `secret` securely for signature verification

// Verify incoming webhook
const isValid = Outbound.verifyWebhookSignature(rawBody, signatureHeader, secret);
```

### Dashboard

```ts
const dashboard = await outbound.dashboard.get();
// dashboard.last30Days.sent, dashboard.quota, etc.

const quota = await outbound.dashboard.quota();
// quota.dailyUsed, quota.monthlyUsed, quota.remaining
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | — | Default API key (optional if provided per call) |
| `baseUrl` | `https://outbound-api.mastersunion.org` | API base URL |
| `timeout` | `30000` | Request timeout in ms |
| `maxRetries` | `3` | Max retries on 429/5xx |
| `retryDelay` | `1000` | Initial retry delay in ms (exponential backoff) |

## Error Handling

All errors extend `OutboundError` with `statusCode`, `message`, and `details`:

```ts
import { Outbound, RateLimitError, NotFoundError } from 'outbound-sdk';

try {
  await outbound.email.send({ ... });
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
