# Getting Started

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

## Quick Setup

### 1. Set your API key

Add your Outbound API key to your environment variables:

```bash
OUTBOUND_API_KEY=mu_outbound_your_api_key_here
```

### 2. Initialize the client

::: code-group
```ts [ESM]
import { Outbound } from '@masters-union/outbound-sdk';

const outbound = new Outbound();
```
```js [CommonJS]
const { Outbound } = require('@masters-union/outbound-sdk');

const outbound = new Outbound();
```
:::

The client automatically reads `OUTBOUND_API_KEY` from your environment.

### 3. Send your first email

```ts
const { jobId, messageId } = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Welcome!',
  htmlBody: '<h1>Hello World</h1>',
});

console.log(`Email queued: ${jobId}`);
```

### 4. Check delivery status

```ts
const status = await outbound.email.status(jobId);

for (const recipient of status.recipients) {
  console.log(`${recipient.recipient_email}: ${recipient.status}`);
}
```

## What's Next?

- [Configuration](/guide/configuration) — Customize timeouts, retries, and more
- [Error Handling](/guide/error-handling) — Handle errors gracefully
- [Email API](/api/email) — Full email sending reference
- [Templates API](/api/templates) — Create and send with reusable templates
