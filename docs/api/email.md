# Email

Send single and bulk emails, and track delivery status by job ID.

All examples assume you've set the API key in the constructor. For multi-tenant usage, pass `{ apiKey }` as the last argument to any method. See [Configuration](/guide/configuration).

## Send Single Email

Send one email to one recipient.

```ts
const result = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@yourcompany.com',
  emailSubject: 'Your order has shipped',
  htmlBody: '<h1>Order #1234 Shipped</h1><p>Your package is on its way.</p>',
  textBody: 'Order #1234 Shipped. Your package is on its way.',
  senderName: 'YourCompany',
  replyTo: 'support@yourcompany.com',
});
```

### Full Parameters

```ts
await outbound.email.send({
  // Required
  toEmail: 'user@example.com',
  fromEmail: 'noreply@yourcompany.com',  // must be a verified domain
  emailSubject: 'Subject line',
  htmlBody: '<h1>Email content</h1>',

  // Optional
  textBody: 'Plain text fallback',
  senderName: 'Display Name',            // shows as "Display Name <noreply@...>"
  replyTo: 'support@yourcompany.com',
  ccEmail: 'cc@example.com',
  bccEmail: 'bcc@example.com',
  priority: 'high',                       // 'low' | 'normal' | 'high' (default: 'normal')
  idempotencyKey: 'order-shipped-1234',   // prevents duplicate sends
  metadata: { orderId: '1234', userId: 'u_abc' },
  headers: { 'X-Custom-Header': 'value' },
  tracking: { opens: true, clicks: true },
  attachments: [
    {
      filename: 'invoice.pdf',
      content: 'base64-encoded-content-here',
      contentType: 'application/pdf',
    },
  ],
});
```

### Parameters Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toEmail` | `string` | Yes | Recipient email address |
| `fromEmail` | `string` | Yes | Sender email — **must be a verified domain assigned to your tenant** |
| `emailSubject` | `string` | Yes | Email subject line |
| `htmlBody` | `string` | Yes | HTML email body |
| `textBody` | `string` | No | Plain text alternative (recommended for deliverability) |
| `senderName` | `string` | No | Display name shown to recipient |
| `replyTo` | `string` | No | Reply-to email address |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `priority` | `string` | No | `'low'`, `'normal'` (default), or `'high'` |
| `idempotencyKey` | `string` | No | Unique key to prevent duplicate sends (see below) |
| `metadata` | `object` | No | Custom key-value pairs stored with the email |
| `headers` | `object` | No | Custom email headers |
| `tracking` | `object` | No | Open and click tracking configuration |
| `attachments` | `Attachment[]` | No | File attachments (max 10MB each, 25MB total) |

### Response

```ts
{
  message: 'Email queued successfully',
  jobId: '550e8400-e29b-41d4-a716-446655440000',
  messageId: '660e8400-e29b-41d4-a716-446655440001'
}
```

| Field | Description |
|-------|-------------|
| `jobId` | Unique job ID — use this to check delivery status |
| `messageId` | Unique message ID for this specific recipient |

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `BadRequestError` | 400 | Missing required fields, invalid email format |
| `AuthenticationError` | 401 | Invalid or missing API key |
| `ForbiddenError` | 403 | Domain not verified, tenant suspended, quota exceeded |
| `ConflictError` | 409 | Duplicate `idempotencyKey` (returns existing job) |
| `RateLimitError` | 429 | Exceeded your per-second rate limit |

### Idempotency

Use `idempotencyKey` to safely retry without sending duplicate emails:

```ts
// First call — email is queued
const result1 = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Order Confirmation',
  htmlBody: '<h1>Order confirmed</h1>',
  idempotencyKey: 'order-confirm-1234',
});

// Second call with same key — returns existing job, no duplicate sent
const result2 = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Order Confirmation',
  htmlBody: '<h1>Order confirmed</h1>',
  idempotencyKey: 'order-confirm-1234',
});

// result1.jobId === result2.jobId ✓
```

### Attachments

```ts
import { readFileSync } from 'fs';

await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Your Invoice',
  htmlBody: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice-march-2026.pdf',
      content: readFileSync('./invoice.pdf').toString('base64'),
      contentType: 'application/pdf',
    },
    {
      filename: 'logo.png',
      content: readFileSync('./logo.png').toString('base64'),
      contentType: 'image/png',
    },
  ],
});
```

::: warning Attachment Limits
- Max **10MB** per individual attachment
- Max **25MB** total per email
- Content must be **base64 encoded**
:::

---

## Send Bulk Emails

Send up to **500 emails** in a single API call. Each recipient can have a different HTML body and subject.

```ts
const result = await outbound.email.bulk({
  fromEmail: 'noreply@yourcompany.com',
  emailSubject: 'Monthly Newsletter',
  senderName: 'YourCompany',
  replyTo: 'newsletter@yourcompany.com',
  emails: [
    {
      toEmail: 'alice@example.com',
      htmlBody: '<h1>Hi Alice</h1><p>Your personalized content here.</p>',
    },
    {
      toEmail: 'bob@example.com',
      htmlBody: '<h1>Hi Bob</h1><p>Different content for Bob.</p>',
      subject: 'Bob, check this out!',  // overrides emailSubject for this recipient
    },
    {
      toEmail: 'charlie@example.com',
      htmlBody: '<h1>Hi Charlie</h1>',
      metadata: { segment: 'vip' },
    },
  ],
});
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fromEmail` | `string` | Yes | Sender email (verified domain) |
| `emailSubject` | `string` | Yes | Default subject for all recipients |
| `emails` | `BulkEmailRecipient[]` | Yes | Array of recipients (**max 500**) |
| `senderName` | `string` | No | Display name |
| `replyTo` | `string` | No | Reply-to address |
| `idempotencyKey` | `string` | No | Prevents duplicate bulk sends |

### Recipient Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toEmail` | `string` | Yes | Recipient email address |
| `htmlBody` | `string` | Yes | HTML body for this specific recipient |
| `subject` | `string` | No | Override the default `emailSubject` for this recipient |
| `textBody` | `string` | No | Plain text alternative |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `metadata` | `object` | No | Custom metadata for this recipient |

### Response

```ts
{
  message: 'Bulk email queued successfully',
  jobId: '550e8400-e29b-41d4-a716-446655440000',
  recipientCount: 485,      // actual emails that will be sent
  suppressedCount: 12,      // emails filtered out (on suppression list)
  suppressedEmails: [       // which emails were suppressed
    'bounced@example.com',
    'complained@example.com'
  ],
  duplicatesRemoved: 3      // duplicate toEmails that were deduplicated
}
```

### Automatic Filtering

The platform automatically handles:

1. **Deduplication** — If you include the same `toEmail` twice, only the first occurrence is kept
2. **Suppression filtering** — Emails on your suppression list (bounces, complaints, manual suppressions, unsubscribes) are silently removed
3. **Quota reservation** — Only valid, non-suppressed recipients count against your quota

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `BadRequestError` | 400 | Empty `emails` array, exceeds 500 limit, missing required fields |
| `ForbiddenError` | 403 | Domain not verified, tenant suspended, insufficient quota |
| `ConflictError` | 409 | Duplicate `idempotencyKey` |
| `RateLimitError` | 429 | Exceeded rate limit |

---

## Check Job Status

Track the delivery status of every recipient in a job.

```ts
const status = await outbound.email.status('550e8400-e29b-41d4-a716-446655440000');
```

### Response

```ts
{
  job: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tenant_id: 'uuid',
    total_recipients: 500,
    status: 'completed',       // 'queued' | 'processing' | 'completed' | 'failed'
    priority: 'normal',
    created_at: '2026-03-08T10:00:00.000Z',
    updated_at: '2026-03-08T10:01:00.000Z'
  },
  recipients: [
    {
      message_id: '660e8400-e29b-41d4-a716-446655440001',
      recipient_email: 'alice@example.com',
      status: 'delivered',
      ses_message_id: 'aws-ses-message-id',
      error_message: null,
      created_at: '2026-03-08T10:00:00.000Z'
    },
    {
      message_id: '660e8400-e29b-41d4-a716-446655440002',
      recipient_email: 'bad-address@example.com',
      status: 'bounced',
      ses_message_id: 'aws-ses-message-id',
      error_message: null,
      created_at: '2026-03-08T10:00:00.000Z'
    },
    {
      message_id: '660e8400-e29b-41d4-a716-446655440003',
      recipient_email: 'invalid@nonexistent.tld',
      status: 'failed',
      ses_message_id: null,
      error_message: 'Email address not verified',
      created_at: '2026-03-08T10:00:00.000Z'
    }
  ]
}
```

### Recipient Status Reference

| Status | Description | Final? |
|--------|-------------|--------|
| `queued` | Waiting in the queue | No |
| `processing` | Being sent to AWS SES | No |
| `sent` | SES accepted the email | No |
| `delivered` | Delivered to recipient's mailbox | Yes |
| `bounced` | Hard or soft bounce | Yes |
| `complained` | Recipient reported as spam | Yes |
| `opened` | Recipient opened the email | No (can become `clicked`) |
| `clicked` | Recipient clicked a link | Yes |
| `failed` | Failed to send to SES | Yes |

::: info Status Updates
Statuses update asynchronously as AWS SES sends delivery notifications back to the platform. `sent` → `delivered` can take a few seconds to a few minutes. `opened` and `clicked` events depend on tracking being enabled and may arrive hours later.
:::

### Polling Example

```ts
async function waitForDelivery(jobId: string, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const { recipients } = await outbound.email.status(jobId);

    const allDone = recipients.every(r =>
      ['delivered', 'bounced', 'complained', 'failed'].includes(r.status)
    );

    if (allDone) {
      const delivered = recipients.filter(r => r.status === 'delivered').length;
      console.log(`${delivered}/${recipients.length} delivered`);
      return recipients;
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error('Timed out waiting for delivery');
}
```

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `NotFoundError` | 404 | Job ID doesn't exist or belongs to a different tenant |
| `AuthenticationError` | 401 | Invalid API key |
