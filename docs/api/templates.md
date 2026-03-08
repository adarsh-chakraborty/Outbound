# Templates

Create reusable email templates with variable substitution using `{{variableName}}` syntax.

## Create Template

```ts
const { template } = await outbound.templates.create({
  name: 'welcome-email',
  subject: 'Welcome {{firstName}}!',
  htmlBody: '<h1>Hello {{firstName}}</h1><p>Welcome to {{company}}.</p>',
  variables: ['firstName', 'company'],
});
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | Yes | Unique template name (within your tenant) |
| `subject` | `string` | Yes | Subject line (supports `{{variables}}`) |
| `htmlBody` | `string` | Yes | HTML body (supports `{{variables}}`) |
| `textBody` | `string` | No | Plain text alternative |
| `variables` | `string[]` | No | List of variable names used |
| `metadata` | `object` | No | Custom metadata |

## List Templates

```ts
const { templates, total, quota } = await outbound.templates.list({
  status: 'active',
  search: 'welcome',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  page: 1,
  limit: 20,
});
```

### Query Parameters

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `status` | `'active' \| 'archived'` | — | Filter by status |
| `search` | `string` | — | Search by template name |
| `sortBy` | `string` | `createdAt` | Sort field: `name`, `createdAt`, `use_count`, `last_sent_at` |
| `sortOrder` | `'ASC' \| 'DESC'` | `DESC` | Sort direction |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page (max 100) |

### Auto-Pagination

Iterate through all templates without managing pages:

```ts
for await (const template of outbound.templates.listAll({ status: 'active' })) {
  console.log(template.name);
}
```

## Get Template

```ts
const { template } = await outbound.templates.get('template-uuid');
```

## Update Template

```ts
const { template } = await outbound.templates.update('template-uuid', {
  subject: 'Updated Subject {{firstName}}',
  status: 'archived',
});
```

### Parameters

All fields are optional — only pass what you want to change:

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | New template name |
| `subject` | `string` | New subject line |
| `htmlBody` | `string` | New HTML body |
| `textBody` | `string` | New text body |
| `variables` | `string[]` | Updated variable list |
| `metadata` | `object` | Updated metadata |
| `status` | `'active' \| 'archived'` | Change status |

## Delete Template

```ts
await outbound.templates.delete('template-uuid');
```

## Duplicate Template

```ts
const { template } = await outbound.templates.duplicate('template-uuid', {
  name: 'welcome-email-v2', // optional, defaults to "Copy of {original}"
});
```

## Preview Template

Render a template with sample variables without sending:

```ts
const preview = await outbound.templates.preview('template-uuid', {
  variables: { firstName: 'John', company: 'Acme' },
});

console.log(preview.subject);   // "Welcome John!"
console.log(preview.htmlBody);  // "<h1>Hello John</h1>..."
console.log(preview.missingVariables); // [] or ['unsetVar']
```

## Send with Template

### Single Send

```ts
const { jobId, messageId } = await outbound.templates.send({
  templateId: 'template-uuid',
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  variables: { firstName: 'John', company: 'Acme' },
});
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `templateId` | `string` | Yes | Template ID |
| `toEmail` | `string` | Yes | Recipient email |
| `fromEmail` | `string` | Yes | Sender email (verified domain) |
| `variables` | `object` | No | Template variable values |
| `senderName` | `string` | No | Display name |
| `replyTo` | `string` | No | Reply-to address |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `priority` | `string` | No | `low`, `normal`, or `high` |
| `idempotencyKey` | `string` | No | Prevents duplicate sends |
| `metadata` | `object` | No | Custom metadata |
| `headers` | `object` | No | Custom headers |
| `tracking` | `object` | No | Tracking config |

### Bulk Send

Send to up to 500 recipients with per-recipient variables:

```ts
const result = await outbound.templates.bulkSend({
  templateId: 'template-uuid',
  fromEmail: 'noreply@company.com',
  senderName: 'Company',
  recipients: [
    { toEmail: 'alice@example.com', variables: { firstName: 'Alice' } },
    { toEmail: 'bob@example.com', variables: { firstName: 'Bob' } },
  ],
});
```

#### Response

```ts
{
  message: 'Bulk email queued successfully',
  jobId: 'uuid',
  recipientCount: 2,
  suppressedCount: 0,
  suppressedEmails: [],
  duplicatesRemoved: 0,
  usingSesTemplate: true
}
```

## Template Statistics

```ts
const stats = await outbound.templates.stats();
```

### Response

```ts
{
  quota: { used: 45, allocated: 1000, remaining: 955 },
  counts: { total: 45, active: 43, archived: 2, neverUsed: 5 },
  totalEmailsSentViaTemplates: 15000,
  mostUsed: [ /* top 5 templates */ ],
  leastUsed: [ /* bottom 5 templates */ ],
  recentlyUsed: [ /* 5 most recently used */ ]
}
```
