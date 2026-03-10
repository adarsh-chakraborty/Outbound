// ===== Client Config =====

export interface OutboundConfig {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface ResolvedConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

// ===== Email =====

export interface SendEmailParams {
  toEmail: string;
  fromEmail: string;
  emailSubject: string;
  htmlBody: string;
  ccEmail?: string;
  bccEmail?: string;
  senderName?: string;
  replyTo?: string;
  textBody?: string;
  priority?: 'low' | 'normal' | 'high';
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  headers?: Record<string, string>;
  tracking?: Record<string, unknown>;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  content: string;
  contentType: string;
}

export interface SendEmailResponse {
  message: string;
  jobId: string;
  messageId: string;
  duplicate?: boolean;
}

export interface BulkEmailParams {
  fromEmail: string;
  emailSubject: string;
  emails: BulkEmailRecipient[];
  senderName?: string;
  replyTo?: string;
  idempotencyKey?: string;
}

export interface BulkEmailRecipient {
  toEmail: string;
  htmlBody: string;
  subject?: string;
  textBody?: string;
  ccEmail?: string;
  bccEmail?: string;
  metadata?: Record<string, unknown>;
  attachments?: Attachment[];
}

export interface BulkEmailResponse {
  message: string;
  jobId: string;
  recipientCount: number;
  suppressedCount: number;
  suppressedEmails: string[];
  duplicatesRemoved: number;
}

export interface JobStatusResponse {
  job: Record<string, unknown>;
  recipients: EmailRecipientStatus[];
}

export interface EmailRecipientStatus {
  message_id: string;
  recipient_email: string;
  status: EmailStatus;
  ses_message_id?: string;
  error_message?: string;
  created_at: string;
}

export type EmailStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'complained'
  | 'opened'
  | 'clicked'
  | 'failed';

// ===== Templates =====

export interface CreateTemplateParams {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  variables?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateTemplateParams {
  name?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  variables?: string[];
  metadata?: Record<string, unknown>;
  status?: 'active' | 'archived';
}

export interface ListTemplatesParams {
  status?: 'active' | 'archived';
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'use_count' | 'last_sent_at';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface ListTemplatesResponse {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  quota: {
    used: number;
    allocated: number;
    remaining: number;
  };
}

export interface Template {
  id: string;
  tenant_id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  variables: string[];
  use_count: number;
  last_sent_at?: string;
  ses_template_name?: string;
  status: 'active' | 'archived';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TemplateResponse {
  message?: string;
  template: Template;
}

export interface TemplateSendParams {
  templateId: string;
  toEmail: string;
  fromEmail: string;
  senderName?: string;
  replyTo?: string;
  ccEmail?: string;
  bccEmail?: string;
  variables?: Record<string, string>;
  priority?: 'low' | 'normal' | 'high';
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  headers?: Record<string, string>;
  tracking?: Record<string, unknown>;
}

export interface TemplateBulkSendParams {
  templateId: string;
  fromEmail: string;
  senderName?: string;
  replyTo?: string;
  idempotencyKey?: string;
  recipients: TemplateBulkRecipient[];
}

export interface TemplateBulkRecipient {
  toEmail: string;
  variables?: Record<string, string>;
  ccEmail?: string;
  bccEmail?: string;
  metadata?: Record<string, unknown>;
}

export interface TemplateBulkSendResponse {
  message: string;
  jobId: string;
  recipientCount: number;
  suppressedCount: number;
  suppressedEmails: string[];
  duplicatesRemoved: number;
  usingSesTemplate: boolean;
}

export interface TemplatePreviewParams {
  variables?: Record<string, string>;
}

export interface TemplatePreviewResponse {
  subject: string;
  htmlBody: string;
  textBody?: string;
  missingVariables?: string[];
}

export interface TemplateStatsResponse {
  quota: {
    used: number;
    allocated: number;
    remaining: number;
  };
  counts: {
    total: number;
    active: number;
    archived: number;
    neverUsed: number;
  };
  totalEmailsSentViaTemplates: number;
  mostUsed: Template[];
  leastUsed: Template[];
  recentlyUsed: Template[];
}

// ===== Suppressions =====

export interface ListSuppressionsParams {
  page?: number;
  limit?: number;
  reason?: 'bounce' | 'complaint' | 'manual' | 'unsubscribe';
}

export interface ListSuppressionsResponse {
  suppressions: Suppression[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface Suppression {
  id: string;
  tenant_id: string;
  email: string;
  reason: string;
  created_at: string;
}

export interface AddSuppressionParams {
  email: string;
  reason?: 'bounce' | 'complaint' | 'manual' | 'unsubscribe';
}

export interface SuppressionResponse {
  suppression: Suppression;
}

// ===== Webhooks =====

export type WebhookEvent =
  | 'send'
  | 'delivery'
  | 'bounce'
  | 'complaint'
  | 'open'
  | 'click'
  | 'reject'
  | 'rendering_failure';

export interface CreateWebhookParams {
  url: string;
  events: WebhookEvent[];
  retryInterval?: number;
  maxRetries?: number;
}

export interface UpdateWebhookParams {
  url?: string;
  events?: WebhookEvent[];
  active?: boolean;
  retryInterval?: number;
  maxRetries?: number;
}

export interface Webhook {
  id: string;
  tenant_id: string;
  url: string;
  events: WebhookEvent[];
  retry_interval: number;
  max_retries: number;
  active: boolean;
  status: 'active' | 'defective';
  created_at: string;
}

export interface CreateWebhookResponse {
  webhook: Webhook;
  secret: string;
  warning: string;
}

export interface UpdateWebhookResponse {
  message: string;
  webhook: Webhook;
}

export interface ListWebhooksResponse {
  webhooks: Webhook[];
}

// ===== Dashboard =====

export interface DashboardResponse {
  quota: Record<string, unknown>;
  templates: {
    used: number;
    active: number;
    allocated: number;
    remaining: number;
  };
  last30Days: {
    sent: number;
    delivered: number;
    bounced: number;
    complained: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  recentJobs: Record<string, unknown>[];
}

export interface QuotaResponse {
  used: number;
  allocated: number;
  remaining: number;
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
  percentageUsed: number;
  resetDate: string;
}
