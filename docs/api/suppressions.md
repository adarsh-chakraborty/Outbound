# Suppressions

Manage your email suppression list. Suppressed email addresses are automatically blocked from receiving future emails — they are silently filtered out during sends and don't count against your quota.

The platform automatically adds addresses to the suppression list when emails bounce or receive complaints. You can also manually suppress or unsuppress addresses via the SDK.

---

## List Suppressions

```ts
const result = await outbound.suppressions.list({
  reason: 'bounce',
  page: 1,
  limit: 50,
});

console.log(result.pagination.total);  // 150 total suppressed emails
for (const s of result.suppressions) {
  console.log(`${s.email} — ${s.reason} — ${s.created_at}`);
}
```

### Query Parameters

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `reason` | `string` | All | Filter by reason: `bounce`, `complaint`, `manual`, `unsubscribe` |
| `page` | `number` | `1` | Page number (min: 1) |
| `limit` | `number` | `50` | Items per page (min: 1, max: 100) |

### Response

```ts
{
  suppressions: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      tenant_id: 'uuid',
      email: 'bounced-user@example.com',
      reason: 'bounce',
      created_at: '2026-03-08T10:00:00.000Z'
    },
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      tenant_id: 'uuid',
      email: 'spam-reporter@example.com',
      reason: 'complaint',
      created_at: '2026-03-07T15:30:00.000Z'
    }
  ],
  pagination: {
    page: 1,
    limit: 50,
    total: 150
  }
}
```

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `AuthenticationError` | 401 | Invalid or missing API key |

---

## Auto-Pagination

Iterate through **all** suppressed emails without managing pages manually:

```ts
for await (const suppression of outbound.suppressions.listAll({ reason: 'bounce' })) {
  console.log(`${suppression.email} — bounced on ${suppression.created_at}`);
}
```

You can also pass a `limit` to control batch size (default: 50, max: 100):

```ts
for await (const suppression of outbound.suppressions.listAll({ limit: 100 })) {
  // fetches 100 per page internally
}
```

---

## Add Suppression

Manually add an email address to your suppression list. Future sends to this address will be silently filtered out.

```ts
const { suppression } = await outbound.suppressions.add({
  email: 'bad-address@example.com',
  reason: 'manual',
});

console.log(suppression.id);         // 'uuid'
console.log(suppression.email);      // 'bad-address@example.com'
console.log(suppression.reason);     // 'manual'
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Email address to suppress (auto-lowercased) |
| `reason` | `string` | No | One of: `bounce`, `complaint`, `manual`, `unsubscribe` (default: `manual`) |

### Response

```ts
{
  suppression: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tenant_id: 'uuid',
    email: 'bad-address@example.com',
    reason: 'manual',
    created_at: '2026-03-08T10:00:00.000Z'
  }
}
```

::: info Idempotent
If the email is already on your suppression list, the **existing record is returned** — no duplicate is created, no error is thrown.
:::

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `BadRequestError` | 400 | Missing `email` field |
| `AuthenticationError` | 401 | Invalid or missing API key |

---

## Remove Suppression

Remove an email address from your suppression list, allowing future sends to this address.

```ts
const result = await outbound.suppressions.remove('bad-address@example.com');
// { message: 'Suppression removed' }
```

The email parameter is URL-encoded automatically by the SDK.

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `NotFoundError` | 404 | Email is not on your suppression list |
| `AuthenticationError` | 401 | Invalid or missing API key |

::: warning
Removing a bounced or complained email from your suppression list means future sends to that address will go through. Only do this if you're confident the issue has been resolved (e.g., the recipient fixed their mailbox).
:::

---

## Suppression Reasons

| Reason | Description | Added By |
|--------|-------------|----------|
| `bounce` | Email bounced (invalid address, full mailbox, etc.) | Platform (automatic) |
| `complaint` | Recipient reported the email as spam | Platform (automatic) |
| `manual` | Manually added via SDK or dashboard | You |
| `unsubscribe` | Recipient clicked an unsubscribe link | Platform (automatic) |

---

## How Suppression Affects Sending

When you send an email (single, bulk, or template-based), the platform checks each recipient against your suppression list **before** sending:

- **Single send** (`outbound.email.send()`) — if the recipient is suppressed, the email is silently skipped
- **Bulk send** (`outbound.email.bulk()`) — suppressed recipients are removed from the batch and reported in the response:
  ```ts
  {
    recipientCount: 485,     // emails that will be sent
    suppressedCount: 12,     // emails filtered out
    suppressedEmails: ['bounced@example.com', 'complained@example.com']
  }
  ```
- **Template bulk send** (`outbound.templates.bulkSend()`) — same behavior as bulk send

Suppressed emails **do not count** against your sending quota.

---

## Complete Example: Managing Suppressions

```ts
import { Outbound, NotFoundError } from '@masters-union/outbound-sdk';

const outbound = new Outbound();

// 1. Check current suppressions
const result = await outbound.suppressions.list();
console.log(`${result.pagination.total} emails suppressed`);

// 2. Review bounces
for await (const s of outbound.suppressions.listAll({ reason: 'bounce' })) {
  console.log(`Bounced: ${s.email} on ${s.created_at}`);
}

// 3. Manually suppress an email
await outbound.suppressions.add({
  email: 'do-not-email@example.com',
  reason: 'manual',
});

// 4. Remove a suppression (e.g., user re-verified their email)
try {
  await outbound.suppressions.remove('do-not-email@example.com');
  console.log('Suppression removed — email can receive messages again');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Email was not on the suppression list');
  }
}

// 5. Bulk send — suppressed emails are auto-filtered
const bulkResult = await outbound.email.bulk({
  fromEmail: 'noreply@yourcompany.com',
  emailSubject: 'Monthly Update',
  emails: allRecipients.map(r => ({
    toEmail: r.email,
    htmlBody: `<h1>Hi ${r.name}</h1>`,
  })),
});

console.log(`Sent: ${bulkResult.recipientCount}`);
console.log(`Suppressed: ${bulkResult.suppressedCount}`);
console.log(`Suppressed emails:`, bulkResult.suppressedEmails);
```
