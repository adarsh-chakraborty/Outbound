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

  async create(params: CreateTemplateParams): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>('/v1/email-templates', params);
  }

  async list(params?: ListTemplatesParams): Promise<ListTemplatesResponse> {
    return this.http.get<ListTemplatesResponse>('/v1/email-templates', params as Record<string, unknown>);
  }

  async *listAll(params?: Omit<ListTemplatesParams, 'page'>): AsyncGenerator<Template> {
    let page = 1;
    const limit = params?.limit || 20;

    while (true) {
      const result = await this.list({ ...params, page, limit });
      for (const template of result.templates) {
        yield template;
      }
      if (result.templates.length < limit) break;
      page++;
    }
  }

  async get(id: string): Promise<TemplateResponse> {
    return this.http.get<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}`);
  }

  async update(id: string, params: UpdateTemplateParams): Promise<TemplateResponse> {
    return this.http.patch<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}`, params);
  }

  async delete(id: string): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`/v1/email-templates/${encodeURIComponent(id)}`);
  }

  async duplicate(id: string, params?: { name?: string }): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}/duplicate`, params);
  }

  async preview(id: string, params?: TemplatePreviewParams): Promise<TemplatePreviewResponse> {
    return this.http.post<TemplatePreviewResponse>(`/v1/email-templates/${encodeURIComponent(id)}/preview`, params);
  }

  async send(params: TemplateSendParams): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>('/v1/email-templates/send', params);
  }

  async bulkSend(params: TemplateBulkSendParams): Promise<TemplateBulkSendResponse> {
    return this.http.post<TemplateBulkSendResponse>('/v1/email-templates/bulk', params);
  }

  async stats(): Promise<TemplateStatsResponse> {
    return this.http.get<TemplateStatsResponse>('/v1/email-templates/stats');
  }
}
