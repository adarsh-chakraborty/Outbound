# Webhooks

Receive real-time notifications when email events occur — deliveries, bounces, opens, clicks, and more. Subscribe your endpoint, and the platform pushes events to you as they happen.

## Create Webhook

```ts
const { webhook, secret } = await outbound.webhooks.create(apiKey, {
  url: 'https://myapp.com/webhooks/outbound',
  events: ['delivery', 'bounce', 'complaint', 'open', 'click'],
  retryInterval: 300,
  maxRetries: 3,
});

// ⚠️ Store `secret` securely — it's only returned once!
console.log(webhook.id);  // 'uuid'
console.log(secret);      // '64-char hex string'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | HTTPS endpoint to receive events |
| `events` | `WebhookEvent[]` | Yes | Event types to subscribe to (see table below) |
| `retryInterval` | `number` | No | Seconds between retries (default: `300`) |
| `maxRetries` | `number` | No | Max retry attempts (default: `3`) |

::: warning Retry Constraint
`retryInterval × maxRetries` must not exceed **86,400 seconds** (24 hours). For example, `retryInterval: 3600` with `maxRetries: 24` is the maximum. Exceeding this returns a `400 Bad Request`.
:::

### Available Events

| Event | Description |
|-------|-------------|
| `send` | Email accepted by AWS SES |
| `delivery` | Email delivered to recipient's mailbox |
| `bounce` | Email bounced (hard or soft) |
| `complaint` | Recipient reported as spam |
| `open` | Recipient opened the email |
| `click` | Recipient clicked a tracked link |
| `reject` | Email rejected by SES before sending |
| `rendering_failure` | Template rendering failed |

### Response

```ts
{
  webhook: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://myapp.com/webhooks/outbound',
    events: ['delivery', 'bounce', 'complaint', 'open', 'click'],
    retry_interval: 300,
    max_retries: 3,
    active: true,
    status: 'active'
  },
  secret: 'a1b2c3d4e5f6...64-char-hex-string',
  warning: 'Store this secret securely. It will not be shown again.'
}
```

| Field | Description |
|-------|-------------|
| `webhook` | The created webhook object |
| `secret` | HMAC signing secret — **only returned on creation**. Store it securely. |
| `warning` | Reminder to save the secret |

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `BadRequestError` | 400 | Missing `url` or `events`, invalid event type, retry constraint exceeded |
| `AuthenticationError` | 401 | Invalid or missing API key |

---

## List Webhooks

Retrieve all webhooks registered for your tenant.

```ts
const { webhooks } = await outbound.webhooks.list(apiKey);

for (const wh of webhooks) {
  console.log(`${wh.url} — ${wh.status} — events: ${wh.events.join(', ')}`);
}
```

### Response

```ts
{
  webhooks: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      url: 'https://myapp.com/webhooks/outbound',
      events: ['delivery', 'bounce', 'complaint', 'open', 'click'],
      retry_interval: 300,
      max_retries: 3,
      active: true,
      status: 'active',
      created_at: '2026-03-08T10:00:00.000Z'
    }
  ]
}
```

### Webhook Status Reference

| Status | Description |
|--------|-------------|
| `active` | Webhook is enabled and receiving events |
| `defective` | Too many consecutive delivery failures — webhook is auto-disabled |

::: tip
A `defective` webhook can be re-enabled by updating it with `active: true`. This resets the status back to `active`.
:::

---

## Update Webhook

Only pass the fields you want to change:

```ts
const { webhook } = await outbound.webhooks.update(apiKey, 'webhook-uuid', {
  events: ['delivery', 'bounce'],
  active: true,
});
```

### Parameters

All fields are optional:

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | New HTTPS endpoint |
| `events` | `WebhookEvent[]` | Updated event list |
| `active` | `boolean` | Enable or disable the webhook |
| `retryInterval` | `number` | Seconds between retries |
| `maxRetries` | `number` | Max retry attempts |

### Response

```ts
{
  message: 'Webhook updated',
  webhook: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://myapp.com/webhooks/outbound',
    events: ['delivery', 'bounce'],
    retry_interval: 300,
    max_retries: 3,
    active: true,
    status: 'active',
    created_at: '2026-03-08T10:00:00.000Z'
  }
}
```

### Re-enable a Defective Webhook

```ts
// If a webhook was auto-disabled due to failures, reactivate it:
await outbound.webhooks.update(apiKey, 'webhook-uuid', { active: true });
// status resets from 'defective' → 'active'
```

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `NotFoundError` | 404 | Webhook ID doesn't exist or belongs to another tenant |
| `BadRequestError` | 400 | Invalid event type, retry constraint exceeded |

---

## Delete Webhook

Permanently remove a webhook. **This action is irreversible.**

```ts
const result = await outbound.webhooks.delete(apiKey, 'webhook-uuid');
// { message: 'Webhook deleted', id: 'webhook-uuid' }
```

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `NotFoundError` | 404 | Webhook doesn't exist or belongs to another tenant |

---

## Verify Webhook Signature

When your endpoint receives a webhook, **always verify the signature** to confirm it came from the Outbound platform. The platform signs every payload using HMAC-SHA256 with your webhook secret.

### How Signatures Work

1. The platform serializes the event payload as JSON
2. Signs it with `HMAC-SHA256(payload, your_secret)`
3. Sends the hex-encoded signature in the `x-outbound-signature` header

### Verification with the SDK

```ts
import { Outbound } from '@masters-union/outbound-sdk';

app.post('/webhooks/outbound', (req, res) => {
  const signature = req.headers['x-outbound-signature'];

  const isValid = Outbound.verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET  // the secret from webhooks.create()
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Signature verified — process the event
  const event = req.body;
  console.log(`Event: ${event.type} for ${event.email}`);

  res.status(200).send('OK');
});
```

### Manual Verification (without the SDK)

```ts
import crypto from 'crypto';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

::: warning
Always verify webhook signatures in production to prevent spoofed events. Use `crypto.timingSafeEqual` (not `===`) to prevent timing attacks.
:::

---

## Webhook Payload Format

Every webhook delivery sends a JSON payload to your endpoint:

```ts
{
  type: 'delivery',               // event type
  email: 'user@example.com',      // recipient email
  messageId: 'uuid',              // Outbound message ID
  jobId: 'uuid',                  // Outbound job ID
  timestamp: '2026-03-08T10:01:00.000Z',
  metadata: { orderId: '1234' }   // metadata you passed when sending
}
```

### Event-Specific Fields

**Bounce:**
```ts
{
  type: 'bounce',
  email: 'bad@example.com',
  bounceType: 'Permanent',       // 'Permanent' or 'Transient'
  bounceSubType: 'General',
  // ...common fields
}
```

**Complaint:**
```ts
{
  type: 'complaint',
  email: 'user@example.com',
  complaintFeedbackType: 'abuse',
  // ...common fields
}
```

**Click:**
```ts
{
  type: 'click',
  email: 'user@example.com',
  link: 'https://yourapp.com/dashboard',
  // ...common fields
}
```

---

## Retry Behavior

If your endpoint returns a non-2xx status code or times out, the platform retries delivery:

1. **First attempt** — immediate
2. **Retry 1** — after `retryInterval` seconds (default: 5 minutes)
3. **Retry 2** — after another `retryInterval` seconds
4. **Retry 3** — final attempt (based on `maxRetries`)

If all retries fail, the webhook status is set to `defective` and no further events are sent until you re-enable it.

::: tip Best Practices
- **Return 200 quickly** — process events asynchronously after responding
- **Handle duplicates** — the same event may be delivered more than once during retries
- **Use the `messageId`** as an idempotency key to deduplicate events
- **Monitor webhook status** — check `outbound.webhooks.list(apiKey)` periodically for `defective` webhooks
:::

---

## Complete Example: Webhook Lifecycle

```ts
import { Outbound } from '@masters-union/outbound-sdk';
import express from 'express';

const outbound = new Outbound();
const apiKey = 'mu_outbound_...';
const app = express();
app.use(express.json());

// 1. Create a webhook
const { webhook, secret } = await outbound.webhooks.create(apiKey, {
  url: 'https://myapp.com/webhooks/outbound',
  events: ['delivery', 'bounce', 'complaint', 'open', 'click'],
});

// Save the secret to your config/env
console.log('Webhook secret:', secret);

// 2. Handle incoming events
app.post('/webhooks/outbound', (req, res) => {
  const signature = req.headers['x-outbound-signature'];

  if (!Outbound.verifyWebhookSignature(JSON.stringify(req.body), signature, secret)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;

  switch (event.type) {
    case 'delivery':
      console.log(`Delivered to ${event.email}`);
      break;
    case 'bounce':
      console.log(`Bounced: ${event.email} (${event.bounceType})`);
      // Handle bounced email in your system
      break;
    case 'complaint':
      console.log(`Complaint from ${event.email}`);
      // Unsubscribe user in your system
      break;
    case 'open':
      console.log(`Opened by ${event.email}`);
      break;
    case 'click':
      console.log(`Clicked by ${event.email}: ${event.link}`);
      break;
  }

  res.status(200).send('OK');
});

// 3. List your webhooks
const { webhooks } = await outbound.webhooks.list(apiKey);
console.log(`You have ${webhooks.length} webhook(s)`);

// 4. Update events
await outbound.webhooks.update(apiKey, webhook.id, {
  events: ['delivery', 'bounce', 'complaint'],
});

// 5. Delete when no longer needed
await outbound.webhooks.delete(apiKey, webhook.id);
```
