# Dashboard

Access your tenant analytics, email metrics, and quota usage programmatically. Use this to build internal dashboards, monitor sending health, or check quota before large sends.

---

## Get Dashboard

Get a complete overview of your tenant's email activity and resource usage.

```ts
const dashboard = await outbound.dashboard.get();

console.log(`Quota: ${dashboard.quota.used}/${dashboard.quota.allocated}`);
console.log(`Delivered (30d): ${dashboard.last30Days.delivered}`);
console.log(`Templates: ${dashboard.templates.active} active`);
```

### Response

```ts
{
  quota: {
    used: 45000,
    allocated: 100000,
    remaining: 55000,
    resetDate: '2026-04-01T00:00:00.000Z'
  },
  templates: {
    used: 15,
    active: 14,
    allocated: 1000,
    remaining: 985
  },
  last30Days: {
    sent: 45000,
    delivered: 44500,
    bounced: 200,
    complained: 50,
    opened: 15000,
    clicked: 3000,
    failed: 250
  },
  recentJobs: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      total_recipients: 500,
      status: 'completed',
      priority: 'normal',
      created_at: '2026-03-08T10:00:00.000Z'
    }
    // ... up to 20 most recent jobs
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `quota.used` | `number` | Total emails sent in the current billing period |
| `quota.allocated` | `number` | Maximum emails allowed in the billing period |
| `quota.remaining` | `number` | Emails remaining before hitting the limit |
| `quota.resetDate` | `string` | ISO 8601 date when the quota resets |
| `templates.used` | `number` | Total templates created |
| `templates.active` | `number` | Templates with `active` status |
| `templates.allocated` | `number` | Maximum templates allowed |
| `templates.remaining` | `number` | Templates you can still create |
| `last30Days.sent` | `number` | Emails accepted by SES in the last 30 days |
| `last30Days.delivered` | `number` | Emails delivered to recipients |
| `last30Days.bounced` | `number` | Emails that bounced |
| `last30Days.complained` | `number` | Emails reported as spam |
| `last30Days.opened` | `number` | Emails opened (requires tracking) |
| `last30Days.clicked` | `number` | Links clicked (requires tracking) |
| `last30Days.failed` | `number` | Emails that failed to send |
| `recentJobs` | `array` | Up to 20 most recent email jobs |

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `AuthenticationError` | 401 | Invalid or missing API key |

---

## Get Quota

Get detailed quota usage — useful for checking available capacity before a large send.

```ts
const quota = await outbound.dashboard.quota();

console.log(`Daily: ${quota.dailyUsed}/${quota.dailyLimit}`);
console.log(`Monthly: ${quota.monthlyUsed}/${quota.monthlyLimit}`);
console.log(`Overall: ${quota.percentageUsed}% used`);
```

### Response

```ts
{
  used: 45000,
  allocated: 100000,
  remaining: 55000,
  dailyUsed: 5000,
  dailyLimit: 10000,
  monthlyUsed: 45000,
  monthlyLimit: 300000,
  percentageUsed: 45,
  resetDate: '2026-04-01T00:00:00.000Z'
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `used` | `number` | Total emails sent in current period |
| `allocated` | `number` | Total email allocation |
| `remaining` | `number` | Emails remaining |
| `dailyUsed` | `number` | Emails sent today |
| `dailyLimit` | `number` | Maximum emails allowed per day |
| `monthlyUsed` | `number` | Emails sent this month |
| `monthlyLimit` | `number` | Maximum emails allowed per month |
| `percentageUsed` | `number` | Overall usage as a percentage (0–100) |
| `resetDate` | `string` | ISO 8601 date when the monthly quota resets |

### Possible Errors

| Error | Status | Cause |
|-------|--------|-------|
| `AuthenticationError` | 401 | Invalid or missing API key |

---

## Practical Examples

### Pre-send Quota Check

Before sending a large batch, verify you have enough quota:

```ts
const quota = await outbound.dashboard.quota();
const recipientCount = 500;

if (quota.remaining < recipientCount) {
  console.error(
    `Insufficient quota: need ${recipientCount}, only ${quota.remaining} remaining`
  );
  // Handle gracefully — queue for later, alert admin, etc.
} else if (quota.dailyLimit - quota.dailyUsed < recipientCount) {
  console.warn(
    `Daily limit would be exceeded: ${quota.dailyLimit - quota.dailyUsed} remaining today`
  );
} else {
  // Safe to send
  await outbound.email.bulk({ /* ... */ });
}
```

### Monitoring Dashboard

Build a simple health check that runs on a schedule:

```ts
async function checkEmailHealth() {
  const dashboard = await outbound.dashboard.get();
  const { last30Days, quota } = dashboard;

  // Calculate bounce rate
  const bounceRate = last30Days.sent > 0
    ? (last30Days.bounced / last30Days.sent) * 100
    : 0;

  // Calculate open rate
  const openRate = last30Days.delivered > 0
    ? (last30Days.opened / last30Days.delivered) * 100
    : 0;

  console.log(`Bounce rate: ${bounceRate.toFixed(1)}%`);
  console.log(`Open rate: ${openRate.toFixed(1)}%`);
  console.log(`Quota usage: ${quota.used}/${quota.allocated} (${((quota.used/quota.allocated)*100).toFixed(0)}%)`);

  // Alert on high bounce rate
  if (bounceRate > 5) {
    console.warn('Bounce rate exceeds 5% — review your suppression list');
  }

  // Alert on low quota
  if (quota.remaining < 1000) {
    console.warn(`Low quota: only ${quota.remaining} emails remaining`);
  }
}
```

### Template Usage Overview

Combine dashboard data with template stats:

```ts
const [dashboard, templateStats] = await Promise.all([
  outbound.dashboard.get(),
  outbound.templates.stats(),
]);

console.log(`Templates: ${dashboard.templates.active} active / ${dashboard.templates.allocated} allocated`);
console.log(`Total emails via templates: ${templateStats.totalEmailsSentViaTemplates}`);
console.log(`Most used template: ${templateStats.mostUsed[0]?.name} (${templateStats.mostUsed[0]?.use_count} sends)`);
```
