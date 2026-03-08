# Dashboard

Access your tenant analytics and quota usage.

## Get Dashboard

```ts
const dashboard = await outbound.dashboard.get();
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
  recentJobs: [ /* 20 most recent email jobs */ ]
}
```

### Fields

| Field | Description |
|-------|-------------|
| `quota` | Email sending quota (daily/monthly limits and usage) |
| `templates` | Template quota (used vs allocated) |
| `last30Days` | Email metrics for the last 30 days |
| `recentJobs` | 20 most recent email jobs with status |

## Get Quota

Get detailed quota usage:

```ts
const quota = await outbound.dashboard.quota();
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

### Fields

| Field | Description |
|-------|-------------|
| `dailyUsed` | Emails sent today |
| `dailyLimit` | Max emails per day |
| `monthlyUsed` | Emails sent this month |
| `monthlyLimit` | Max emails per month |
| `percentageUsed` | Overall usage percentage |
| `resetDate` | When the monthly quota resets |

::: tip
Monitor your quota programmatically to avoid hitting limits during bulk sends:

```ts
const quota = await outbound.dashboard.quota();
if (quota.remaining < recipientCount) {
  console.warn(`Only ${quota.remaining} emails remaining in quota`);
}
```
:::
