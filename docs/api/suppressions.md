# Suppressions

Manage your email suppression list. Suppressed emails are automatically blocked from receiving future emails.

## List Suppressions

```ts
const { suppressions, pagination } = await outbound.suppressions.list({
  reason: 'bounce',
  page: 1,
  limit: 50,
});
```

### Query Parameters

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `reason` | `string` | — | Filter: `bounce`, `complaint`, `manual`, `unsubscribe` |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `50` | Items per page (max 100) |

### Response

```ts
{
  suppressions: [
    {
      id: 'uuid',
      tenant_id: 'uuid',
      email: 'user@example.com',
      reason: 'bounce',
      created_at: '2026-03-08T10:00:00.000Z'
    }
  ],
  pagination: { page: 1, limit: 50, total: 150 }
}
```

### Auto-Pagination

```ts
for await (const suppression of outbound.suppressions.listAll({ reason: 'bounce' })) {
  console.log(suppression.email);
}
```

## Add Suppression

```ts
const { suppression } = await outbound.suppressions.add({
  email: 'bad@example.com',
  reason: 'manual', // optional, defaults to 'manual'
});
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | `string` | Yes | Email to suppress |
| `reason` | `string` | No | `bounce`, `complaint`, `manual`, `unsubscribe` (default: `manual`) |

::: info
If the email is already suppressed, the existing record is returned — no duplicate is created.
:::

## Remove Suppression

```ts
await outbound.suppressions.remove('bad@example.com');
```

Removes the email from your suppression list, allowing future sends to this address.

### Suppression Reasons

| Reason | Description |
|--------|-------------|
| `bounce` | Email bounced (auto-added by the platform) |
| `complaint` | Recipient reported spam (auto-added) |
| `manual` | Manually added via API or dashboard |
| `unsubscribe` | Recipient clicked unsubscribe link (auto-added) |
