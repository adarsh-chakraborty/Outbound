# Templates

Create reusable email templates with `{{variable}}` placeholders. Templates are synced to AWS SES for optimized bulk sending.

## Create Template

```ts
const { template } = await outbound.templates.create({
  name: 'welcome-email',
  subject: 'Welcome {{firstName}}!',
  htmlBody: `
    <h1>Hello {{firstName}}</h1>
    <p>Welcome to {{company}}. We're glad to have you.</p>
    <p>Click <a href="{{dashboardUrl}}">here</a> to get started.</p>
  `,
  textBody: 'Hello {{firstName}}, Welcome to {{company}}.',
  variables: ['firstName', 'company', 'dashboardUrl'],
  metadata: { category: 'onboarding', version: '2' },
});

console.log(template.id);               // 'uuid'
console.log(template.ses_template_name); // 'outbound-{uuid}' (auto-synced to SES)
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `name` | `string` | Yes | Unique name within your tenant |
| `subject` | `string` | Yes | Subject line — supports `{{variables}}` |
| `htmlBody` | `string` | Yes | HTML body — supports `{{variables}}` |
| `textBody` | `string` | No | Plain text alternative |
| `variables` | `string[]` | No | List of variable names used in the template |
| `metadata` | `object` | No | Custom key-value pairs |

### Response

```ts
{
  message: 'Template created',
  template: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    tenant_id: 'uuid',
    name: 'welcome-email',
    subject: 'Welcome {{firstName}}!',
    html_body: '<h1>Hello {{firstName}}</h1>...',
    text_body: 'Hello {{firstName}}...',
    variables: ['firstName', 'company', 'dashboardUrl'],
    use_count: 0,
    last_sent_at: null,
    ses_template_name: 'outbound-550e8400...',
    status: 'active',
    metadata: { category: 'onboarding', version: '2' },
    created_at: '2026-03-08T10:00:00.000Z',
    updated_at: '2026-03-08T10:00:00.000Z'
  }
}
```

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `BadRequestError` | 400 | Missing `name`, `subject`, or `htmlBody` |
| `ConflictError` | 409 | Template with this name already exists for your tenant |
| `ForbiddenError` | 403 | Template quota exceeded (check `outbound.templates.stats()`) |

---

## List Templates

```ts
const result = await outbound.templates.list({
  status: 'active',
  search: 'welcome',
  sortBy: 'use_count',
  sortOrder: 'DESC',
  page: 1,
  limit: 20,
});

console.log(result.total);           // 45
console.log(result.quota.remaining); // 955 templates remaining
```

### Query Parameters

| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `status` | `'active' \| 'archived'` | All | Filter by template status |
| `search` | `string` | — | Search by template name (case-insensitive) |
| `sortBy` | `string` | `createdAt` | Sort by: `name`, `createdAt`, `use_count`, `last_sent_at` |
| `sortOrder` | `'ASC' \| 'DESC'` | `DESC` | Sort direction |
| `page` | `number` | `1` | Page number |
| `limit` | `number` | `20` | Items per page (max 100) |

### Response

```ts
{
  templates: [ /* array of Template objects */ ],
  total: 45,
  page: 1,
  limit: 20,
  quota: {
    used: 45,
    allocated: 1000,
    remaining: 955
  }
}
```

### Auto-Pagination

Iterate through **all** templates without managing pages manually:

```ts
for await (const template of outbound.templates.listAll({ status: 'active' })) {
  console.log(`${template.name} — used ${template.use_count} times`);
}
```

---

## Get Single Template

```ts
const { template } = await outbound.templates.get('template-uuid');
```

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `NotFoundError` | 404 | Template ID doesn't exist or belongs to another tenant |

---

## Update Template

Only pass the fields you want to change:

```ts
const { template } = await outbound.templates.update('template-uuid', {
  subject: 'Updated: Welcome {{firstName}}!',
  htmlBody: '<h1>New design</h1><p>Hello {{firstName}}</p>',
  variables: ['firstName'],
});
```

### Parameters

| Field | Type | Description |
| ----- | ---- | ----------- |
| `name` | `string` | Rename the template |
| `subject` | `string` | New subject line |
| `htmlBody` | `string` | New HTML body |
| `textBody` | `string` | New text body |
| `variables` | `string[]` | Updated variable list |
| `metadata` | `object` | Updated metadata |
| `status` | `'active' \| 'archived'` | Archive or reactivate |

### Archive a Template

```ts
await outbound.templates.update('template-uuid', { status: 'archived' });
```

Archived templates cannot be used for sending. Reactivate with `{ status: 'active' }`.

::: info SES Sync
When you update `subject`, `htmlBody`, or `textBody`, the template is automatically re-synced to AWS SES. No manual action needed.
:::

---

## Delete Template

```ts
const result = await outbound.templates.delete('template-uuid');
// { message: 'Template deleted', id: 'template-uuid' }
```

This also deletes the template from AWS SES. **This action is irreversible.**

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `NotFoundError` | 404 | Template doesn't exist |

---

## Duplicate Template

Create a copy of an existing template:

```ts
// With auto-generated name ("Copy of welcome-email")
const { template } = await outbound.templates.duplicate('template-uuid');

// With custom name
const { template } = await outbound.templates.duplicate('template-uuid', {
  name: 'welcome-email-v2',
});
```

The duplicate is a completely independent template with its own ID, `use_count: 0`, and a new SES template. It counts against your template quota.

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `NotFoundError` | 404 | Source template doesn't exist |
| `ForbiddenError` | 403 | Template quota exceeded |
| `ConflictError` | 409 | Name already exists |

---

## Preview Template

Render a template with sample variables **without sending** — useful for testing in your UI:

```ts
const preview = await outbound.templates.preview('template-uuid', {
  variables: { firstName: 'John', company: 'Acme' },
});

console.log(preview.subject);            // "Welcome John!"
console.log(preview.htmlBody);           // "<h1>Hello John</h1><p>Welcome to Acme...</p>"
console.log(preview.missingVariables);   // [] — or ['dashboardUrl'] if not provided
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `variables` | `Record<string, string>` | No | Variable values to substitute |

### Response

```ts
{
  subject: 'Welcome John!',
  htmlBody: '<h1>Hello John</h1><p>Welcome to Acme.</p>',
  textBody: 'Hello John, Welcome to Acme.',
  missingVariables: ['dashboardUrl']   // variables in template but not provided
}
```

::: tip
Use `missingVariables` to validate that your code is passing all required variables before sending.
:::

---

## Send Email with Template

### Single Recipient

```ts
const { jobId, messageId } = await outbound.templates.send({
  templateId: 'template-uuid',
  toEmail: 'user@example.com',
  fromEmail: 'noreply@yourcompany.com',
  senderName: 'YourCompany',
  replyTo: 'support@yourcompany.com',
  variables: {
    firstName: 'John',
    company: 'Acme',
    dashboardUrl: 'https://app.acme.com/dashboard',
  },
  priority: 'high',
  idempotencyKey: 'welcome-john-123',
  metadata: { userId: 'u_123' },
  tracking: { opens: true, clicks: true },
});
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `templateId` | `string` | Yes | Template ID to use |
| `toEmail` | `string` | Yes | Recipient email |
| `fromEmail` | `string` | Yes | Sender email (verified domain) |
| `variables` | `Record<string, string>` | No | Template variable values |
| `senderName` | `string` | No | Display name |
| `replyTo` | `string` | No | Reply-to address |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `priority` | `'low' \| 'normal' \| 'high'` | No | Default: `normal` |
| `idempotencyKey` | `string` | No | Prevents duplicate sends |
| `metadata` | `object` | No | Custom metadata |
| `headers` | `object` | No | Custom email headers |
| `tracking` | `object` | No | Open/click tracking config |

### Response

```ts
{
  message: 'Email queued successfully',
  jobId: 'uuid',
  messageId: 'uuid'
}
```

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `BadRequestError` | 400 | Missing `templateId`, `toEmail`, or `fromEmail` |
| `NotFoundError` | 404 | Template doesn't exist |
| `ForbiddenError` | 403 | Template is archived, domain not verified, quota exceeded |
| `RateLimitError` | 429 | Rate limit exceeded |

---

### Bulk Send with Template

Send the same template to up to **500 recipients** with per-recipient variables. This uses AWS SES `SendBulkEmailCommand` for maximum throughput.

```ts
const result = await outbound.templates.bulkSend({
  templateId: 'template-uuid',
  fromEmail: 'noreply@yourcompany.com',
  senderName: 'YourCompany',
  replyTo: 'support@yourcompany.com',
  idempotencyKey: 'march-newsletter-2026',
  recipients: [
    {
      toEmail: 'alice@example.com',
      variables: { firstName: 'Alice', company: 'Acme' },
    },
    {
      toEmail: 'bob@example.com',
      variables: { firstName: 'Bob', company: 'Acme' },
      ccEmail: 'bob-assistant@example.com',
    },
    {
      toEmail: 'charlie@example.com',
      variables: { firstName: 'Charlie', company: 'Acme' },
      metadata: { segment: 'enterprise' },
    },
  ],
});
```

### Parameters

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `templateId` | `string` | Yes | Template ID |
| `fromEmail` | `string` | Yes | Sender email (verified domain) |
| `recipients` | `TemplateBulkRecipient[]` | Yes | Array of recipients (max 500) |
| `senderName` | `string` | No | Display name |
| `replyTo` | `string` | No | Reply-to address |
| `idempotencyKey` | `string` | No | Prevents duplicate bulk sends |

### Recipient Object

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `toEmail` | `string` | Yes | Recipient email address |
| `variables` | `Record<string, string>` | No | Per-recipient variable values |
| `ccEmail` | `string` | No | CC for this recipient |
| `bccEmail` | `string` | No | BCC for this recipient |
| `metadata` | `object` | No | Per-recipient metadata |

### Response

```ts
{
  message: 'Bulk email queued successfully',
  jobId: 'uuid',
  recipientCount: 487,
  suppressedCount: 10,
  suppressedEmails: ['bounced@example.com', 'spam@example.com'],
  duplicatesRemoved: 3,
  usingSesTemplate: true   // confirms SES bulk template optimization is active
}
```

### Possible Errors

| Error | Status | Cause |
| ----- | ------ | ----- |
| `BadRequestError` | 400 | Empty recipients, exceeds 500 limit |
| `NotFoundError` | 404 | Template doesn't exist |
| `ForbiddenError` | 403 | Template archived, domain not verified, insufficient quota |
| `ConflictError` | 409 | Duplicate `idempotencyKey` |

::: tip SES Template Optimization
When using `bulkSend`, the platform uses AWS SES's `SendBulkEmailCommand` which sends up to 50 recipients per API call instead of one-at-a-time. This is significantly faster for large batches. The `usingSesTemplate: true` field in the response confirms this optimization is active.
:::

---

## Template Statistics

Get an overview of your template usage:

```ts
const stats = await outbound.templates.stats();
```

### Response

```ts
{
  quota: {
    used: 45,
    allocated: 1000,
    remaining: 955
  },
  counts: {
    total: 45,
    active: 43,
    archived: 2,
    neverUsed: 5
  },
  totalEmailsSentViaTemplates: 150000,
  mostUsed: [
    { id: 'uuid', name: 'welcome-email', use_count: 50000, ... },
    // top 5 by use_count
  ],
  leastUsed: [
    { id: 'uuid', name: 'old-promo', use_count: 2, ... },
    // bottom 5 by use_count
  ],
  recentlyUsed: [
    { id: 'uuid', name: 'march-newsletter', last_sent_at: '2026-03-08T...', ... },
    // 5 most recently sent
  ]
}
```

---

## Complete Example: Template Lifecycle

```ts
import { Outbound, NotFoundError } from '@masters-union/outbound-sdk';

const outbound = new Outbound();

// 1. Create
const { template } = await outbound.templates.create({
  name: 'order-confirmation',
  subject: 'Order #{{orderId}} Confirmed',
  htmlBody: `
    <h1>Thank you, {{customerName}}!</h1>
    <p>Your order <strong>#{{orderId}}</strong> has been confirmed.</p>
    <p>Total: {{orderTotal}}</p>
    <p><a href="{{trackingUrl}}">Track your order</a></p>
  `,
  variables: ['customerName', 'orderId', 'orderTotal', 'trackingUrl'],
});

// 2. Preview before sending
const preview = await outbound.templates.preview(template.id, {
  variables: {
    customerName: 'Jane',
    orderId: '1234',
    orderTotal: '$99.99',
    trackingUrl: 'https://track.example.com/1234',
  },
});
console.log('Preview subject:', preview.subject);
// "Order #1234 Confirmed"

// 3. Send to one customer
await outbound.templates.send({
  templateId: template.id,
  toEmail: 'jane@example.com',
  fromEmail: 'orders@yourcompany.com',
  senderName: 'YourCompany Orders',
  variables: {
    customerName: 'Jane',
    orderId: '1234',
    orderTotal: '$99.99',
    trackingUrl: 'https://track.example.com/1234',
  },
});

// 4. Bulk send to many customers
const bulkResult = await outbound.templates.bulkSend({
  templateId: template.id,
  fromEmail: 'orders@yourcompany.com',
  senderName: 'YourCompany Orders',
  recipients: orders.map(order => ({
    toEmail: order.customerEmail,
    variables: {
      customerName: order.customerName,
      orderId: order.id,
      orderTotal: order.total,
      trackingUrl: `https://track.example.com/${order.id}`,
    },
  })),
});

console.log(`Sent to ${bulkResult.recipientCount} customers`);

// 5. Check stats
const stats = await outbound.templates.stats();
console.log(`Template quota: ${stats.quota.used}/${stats.quota.allocated}`);

// 6. Archive when no longer needed
await outbound.templates.update(template.id, { status: 'archived' });
```
