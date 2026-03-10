import type { HttpClient } from '../http';
import type {
  CreateTemplateParams,
  UpdateTemplateParams,
  ListTemplatesParams,
  ListTemplatesResponse,
  Template,
  TemplateResponse,
  TemplateSendParams,
  SendEmailResponse,
  TemplateBulkSendParams,
  TemplateBulkSendResponse,
  TemplatePreviewParams,
  TemplatePreviewResponse,
  TemplateStatsResponse,
} from '../types';

export class TemplatesResource {
  constructor(private http: HttpClient) {}

  async create(apiKey: string, params: CreateTemplateParams): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>(apiKey, '/v1/email-templates', params);
  }

  async list(apiKey: string, params?: ListTemplatesParams): Promise<ListTemplatesResponse> {
    return this.http.get<ListTemplatesResponse>(apiKey, '/v1/email-templates', params as Record<string, unknown>);
  }

  async *listAll(apiKey: string, params?: Omit<ListTemplatesParams, 'page'>): AsyncGenerator<Template> {
    let page = 1;
    const limit = params?.limit || 20;

    while (true) {
      const result = await this.list(apiKey, { ...params, page, limit });
      for (const template of result.templates) {
        yield template;
      }
      if (result.templates.length < limit) break;
      page++;
    }
  }

  async get(apiKey: string, id: string): Promise<TemplateResponse> {
    return this.http.get<TemplateResponse>(apiKey, `/v1/email-templates/${encodeURIComponent(id)}`);
  }

  async update(apiKey: string, id: string, params: UpdateTemplateParams): Promise<TemplateResponse> {
    return this.http.patch<TemplateResponse>(apiKey, `/v1/email-templates/${encodeURIComponent(id)}`, params);
  }

  async delete(apiKey: string, id: string): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(apiKey, `/v1/email-templates/${encodeURIComponent(id)}`);
  }

  async duplicate(apiKey: string, id: string, params?: { name?: string }): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>(apiKey, `/v1/email-templates/${encodeURIComponent(id)}/duplicate`, params);
  }

  async preview(apiKey: string, id: string, params?: TemplatePreviewParams): Promise<TemplatePreviewResponse> {
    return this.http.post<TemplatePreviewResponse>(apiKey, `/v1/email-templates/${encodeURIComponent(id)}/preview`, params);
  }

  async send(apiKey: string, params: TemplateSendParams): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>(apiKey, '/v1/email-templates/send', params);
  }

  async bulkSend(apiKey: string, params: TemplateBulkSendParams): Promise<TemplateBulkSendResponse> {
    return this.http.post<TemplateBulkSendResponse>(apiKey, '/v1/email-templates/bulk', params);
  }

  async stats(apiKey: string): Promise<TemplateStatsResponse> {
    return this.http.get<TemplateStatsResponse>(apiKey, '/v1/email-templates/stats');
  }
}
