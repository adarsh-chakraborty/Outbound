# Webhooks

Receive real-time notifications when email events occur (delivery, bounce, open, etc.).

## Create Webhook

```ts
const { webhook, secret } = await outbound.webhooks.create({
  url: 'https://myapp.com/webhooks/outbound',
  events: ['delivery', 'bounce', 'complaint', 'open'],
  retryInterval: 300,
  maxRetries: 3,
});

// ⚠️ Store `secret` securely — it's only shown once!
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | `string` | Yes | HTTPS endpoint to receive events |
| `events` | `WebhookEvent[]` | Yes | Event types to subscribe to |
| `retryInterval` | `number` | No | Seconds between retries (default: 300) |
| `maxRetries` | `number` | No | Max retry attempts (default: 3) |

### Available Events

| Event | Description |
|-------|-------------|
| `send` | Email accepted by SES |
| `delivery` | Email delivered to recipient |
| `bounce` | Email bounced |
| `complaint` | Recipient reported spam |
| `open` | Recipient opened the email |
| `click` | Recipient clicked a link |
| `reject` | Email rejected by SES |
| `rendering_failure` | Template rendering failed |

### Response

```ts
{
  webhook: {
    id: 'uuid',
    url: 'https://myapp.com/webhooks/outbound',
    events: ['delivery', 'bounce', 'complaint', 'open'],
    retry_interval: 300,
    max_retries: 3,
    active: true,
    status: 'active'
  },
  secret: 'hex-string',
  warning: 'Store this secret securely...'
}
```

## List Webhooks

```ts
const { webhooks } = await outbound.webhooks.list();
```

## Update Webhook

```ts
const { webhook } = await outbound.webhooks.update('webhook-uuid', {
  events: ['delivery', 'bounce'],
  active: true,
});
```

### Parameters

All fields are optional:

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | New endpoint URL |
| `events` | `WebhookEvent[]` | Updated event list |
| `active` | `boolean` | Enable/disable webhook |
| `retryInterval` | `number` | Seconds between retries |
| `maxRetries` | `number` | Max retry attempts |

::: tip
Re-enabling a webhook (setting `active: true`) resets its status from `defective` back to `active`.
:::

## Delete Webhook

```ts
await outbound.webhooks.delete('webhook-uuid');
```

## Verify Webhook Signature

When your endpoint receives a webhook, verify the signature to ensure it's from Outbound:

```ts
import { Outbound } from '@masters-union/outbound-sdk';

app.post('/webhooks/outbound', (req, res) => {
  const signature = req.headers['x-outbound-signature'];
  const isValid = Outbound.verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook event
  const event = req.body;
  console.log(`Event: ${event.type} for ${event.email}`);

  res.status(200).send('OK');
});
```

::: warning
Always verify webhook signatures in production to prevent spoofed events.
:::
