# Email

Send single and bulk emails, and check delivery status.

## Send Single Email

```ts
const result = await outbound.email.send({
  toEmail: 'user@example.com',
  fromEmail: 'noreply@company.com',
  emailSubject: 'Welcome!',
  htmlBody: '<h1>Hello</h1>',
});
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toEmail` | `string` | Yes | Recipient email address |
| `fromEmail` | `string` | Yes | Sender email (must be a verified domain) |
| `emailSubject` | `string` | Yes | Email subject line |
| `htmlBody` | `string` | Yes | HTML email body |
| `textBody` | `string` | No | Plain text alternative |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `senderName` | `string` | No | Display name for sender |
| `replyTo` | `string` | No | Reply-to address |
| `priority` | `'low' \| 'normal' \| 'high'` | No | Email priority (default: `normal`) |
| `idempotencyKey` | `string` | No | Prevents duplicate sends |
| `metadata` | `object` | No | Custom key-value pairs |
| `headers` | `object` | No | Custom email headers |
| `tracking` | `object` | No | Open/click tracking config |
| `attachments` | `Attachment[]` | No | File attachments |

### Attachment Object

```ts
{
  filename: 'report.pdf',
  content: '<base64-encoded-content>',
  contentType: 'application/pdf'
}
```

- Max 10MB per attachment
- Max 25MB total per email

### Response

```ts
{
  message: 'Email queued successfully',
  jobId: 'uuid',
  messageId: 'uuid'
}
```

## Send Bulk Emails

Send up to 500 emails in a single call.

```ts
const result = await outbound.email.bulk({
  fromEmail: 'noreply@company.com',
  emailSubject: 'Newsletter',
  senderName: 'Company',
  emails: [
    { toEmail: 'alice@example.com', htmlBody: '<h1>Hi Alice</h1>' },
    { toEmail: 'bob@example.com', htmlBody: '<h1>Hi Bob</h1>' },
  ],
});
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fromEmail` | `string` | Yes | Sender email |
| `emailSubject` | `string` | Yes | Default subject for all recipients |
| `emails` | `BulkEmailRecipient[]` | Yes | Array of recipients (max 500) |
| `senderName` | `string` | No | Display name |
| `replyTo` | `string` | No | Reply-to address |
| `idempotencyKey` | `string` | No | Prevents duplicate bulk sends |

### Recipient Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `toEmail` | `string` | Yes | Recipient email |
| `htmlBody` | `string` | Yes | HTML body for this recipient |
| `subject` | `string` | No | Override subject for this recipient |
| `textBody` | `string` | No | Plain text alternative |
| `ccEmail` | `string` | No | CC recipient |
| `bccEmail` | `string` | No | BCC recipient |
| `metadata` | `object` | No | Custom metadata |

### Response

```ts
{
  message: 'Bulk email queued successfully',
  jobId: 'uuid',
  recipientCount: 450,
  suppressedCount: 50,
  suppressedEmails: ['bad@example.com'],
  duplicatesRemoved: 0
}
```

::: tip
Duplicate emails are automatically removed. Suppressed emails are filtered out and returned in `suppressedEmails`.
:::

## Check Job Status

```ts
const status = await outbound.email.status('job-uuid');
```

### Response

```ts
{
  job: { /* EmailJob object */ },
  recipients: [
    {
      message_id: 'uuid',
      recipient_email: 'user@example.com',
      status: 'delivered',
      ses_message_id: 'aws-id',
      error_message: null,
      created_at: '2026-03-08T10:00:00.000Z'
    }
  ]
}
```

### Recipient Statuses

| Status | Description |
|--------|-------------|
| `queued` | Waiting to be processed |
| `processing` | Being sent to SES |
| `sent` | Accepted by SES |
| `delivered` | Successfully delivered to recipient |
| `bounced` | Hard or soft bounce |
| `complained` | Recipient marked as spam |
| `opened` | Recipient opened the email |
| `clicked` | Recipient clicked a link |
| `failed` | Failed to send |
