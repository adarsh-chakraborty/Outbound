import { HttpClient } from './http';
import { EmailResource } from './resources/email';
import { TemplatesResource } from './resources/templates';
import { SuppressionsResource } from './resources/suppressions';
import { WebhooksResource } from './resources/webhooks';
import { DashboardResource } from './resources/dashboard';
import type { OutboundConfig, ResolvedConfig } from './types';

const BASE_URL = 'https://outbound-api.mastersunion.org';

export class Outbound {
  readonly email: EmailResource;
  readonly templates: TemplatesResource;
  readonly suppressions: SuppressionsResource;
  readonly webhooks: WebhooksResource;
  readonly dashboard: DashboardResource;

  constructor(config?: OutboundConfig) {
    const resolved: ResolvedConfig = {
      apiKey: config?.apiKey,
      baseUrl: config?.baseUrl || BASE_URL,
      timeout: config?.timeout ?? 30_000,
      maxRetries: config?.maxRetries ?? 3,
      retryDelay: config?.retryDelay ?? 1000,
    };

    const http = new HttpClient(resolved);

    this.email = new EmailResource(http);
    this.templates = new TemplatesResource(http);
    this.suppressions = new SuppressionsResource(http);
    this.webhooks = new WebhooksResource(http);
    this.dashboard = new DashboardResource(http);
  }

  /**
   * Verify a webhook signature using HMAC-SHA256.
   * Use this in your webhook handler to validate incoming requests.
   */
  static verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    // Dynamic import to keep browser-compatible at the type level
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }
}
