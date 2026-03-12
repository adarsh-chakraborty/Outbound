# Getting Started

Outbound is a **SaaS email delivery platform** that lets you send transactional and bulk emails at scale using AWS SES under the hood. As a tenant, you get:

- A dedicated API key with configurable rate limits and quotas
- Verified sender domains assigned to your account
- Reusable email templates with variable substitution
- Real-time webhook notifications for delivery events
- Automatic suppression list management (bounces, complaints, unsubscribes)
- A dashboard with analytics and quota tracking

This SDK wraps the entire Outbound REST API into a clean, typed Node.js interface.

## Installation

::: code-group
```bash [npm]
npm install @masters-union/outbound-sdk
```
```bash [yarn]
yarn add @masters-union/outbound-sdk
```
```bash [pnpm]
pnpm add @masters-union/outbound-sdk
```
:::

**Requirements:** Node.js 18+ (uses native `fetch`)

## Quick Setup

### 1. Get your API key

Your Outbound admin will provide you with an API key. It looks like:

```
mu_outbound_a1b2c3d4e5f6...
```

### 2. Initialize the client

::: code-group
```ts [ESM]
import { Outbound } from '@masters-union/outbound-sdk';

const outbound = new Outbound({ apiKey: 'mu_outbound_...' });
```
```js [CommonJS]
const { Outbound } = require('@masters-union/outbound-sdk');

const outbound = new Outbound({ apiKey: 'mu_outbound_...' });
```
:::

Once you set the API key in the constructor, every method uses it automatically. No need to pass it on every call.

### 3. Send your first email

```ts
const { jobId, messageId } = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@yourcompany.com', // must be a verified domain
  emailSubject: 'Welcome!',
  htmlBody: '<h1>Hello World</h1>',
});

console.log(`Email queued: ${jobId}`);
```

::: warning Verified Domains Only
The `fromEmail` must use a domain that has been verified and assigned to your tenant account by the admin. Sending from an unverified domain will return a `403 Forbidden` error.
:::

### 4. Check delivery status

```ts
const status = await outbound.email.status(jobId);

for (const recipient of status.recipients) {
  console.log(`${recipient.recipient_email}: ${recipient.status}`);
  // "sent" → "delivered" → "opened" → "clicked"
}
```

### 5. Send with a template

```ts
// Create a reusable template
const { template } = await outbound.templates.create({
  name: 'welcome-email',
  subject: 'Welcome {{firstName}}!',
  htmlBody: '<h1>Hello {{firstName}}</h1><p>Welcome to {{company}}.</p>',
  variables: ['firstName', 'company'],
});

// Send to one person
await outbound.templates.send({
  templateId: template.id,
  toEmail: 'user@example.com',
  fromEmail: 'noreply@yourcompany.com',
  variables: { firstName: 'John', company: 'Acme' },
});

// Send to many people
await outbound.templates.bulkSend({
  templateId: template.id,
  fromEmail: 'noreply@yourcompany.com',
  recipients: [
    { toEmail: 'alice@example.com', variables: { firstName: 'Alice', company: 'Acme' } },
    { toEmail: 'bob@example.com', variables: { firstName: 'Bob', company: 'Acme' } },
  ],
});
```

### 6. Multi-tenant usage

The SDK supports multi-tenant applications. You can override the API key on any individual call using the optional last argument:

```ts
const outbound = new Outbound(); // no default apiKey

const tenantAKey = 'mu_outbound_tenant_a_...';
const tenantBKey = 'mu_outbound_tenant_b_...';

// Pass { apiKey } as the last argument to override per call
await outbound.email.send({ /* ... */ }, { apiKey: tenantAKey });
await outbound.email.send({ /* ... */ }, { apiKey: tenantBKey });
```

You can also set a default in the constructor and override only when needed:

```ts
const outbound = new Outbound({ apiKey: tenantAKey }); // default

await outbound.email.send({ /* ... */ });                        // uses tenantAKey
await outbound.email.send({ /* ... */ }, { apiKey: tenantBKey }); // uses tenantBKey
```

## Key Concepts

### Email Lifecycle

Every email goes through these statuses:

```
queued → processing → sent → delivered
                         ↘ bounced
                         ↘ complained
                      delivered → opened → clicked
```

| Status | Meaning |
|--------|---------|
| `queued` | Email is in the queue, waiting to be processed |
| `processing` | Email is being sent to AWS SES |
| `sent` | SES accepted the email |
| `delivered` | Email landed in recipient's inbox |
| `bounced` | Email bounced (bad address or mailbox full) |
| `complained` | Recipient marked it as spam |
| `opened` | Recipient opened the email (requires tracking) |
| `clicked` | Recipient clicked a link (requires tracking) |
| `failed` | Failed to send (SES rejection or error) |

### Suppression List

The platform automatically suppresses emails that bounce or receive complaints. You can also manually suppress emails. Any future send to a suppressed address is **silently filtered out** — it won't count against your quota.

### Quotas

Your tenant account has:
- **Daily limit** — Max emails per day
- **Monthly limit** — Max emails per month
- **Rate limit** — Max emails per second
- **Template limit** — Max number of templates

Check your quota anytime with `outbound.dashboard.quota()`.

## What's Next?

- [Configuration](/guide/configuration) — Customize timeouts, retries, and more
- [Error Handling](/guide/error-handling) — Handle every error type
- [Email API](/api/email) — Single and bulk sending reference
- [Templates API](/api/templates) — Full template lifecycle
- [Webhooks API](/api/webhooks) — Real-time event notifications
