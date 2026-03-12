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
  RequestOverrides,
} from '../types';

export class TemplatesResource {
  constructor(private http: HttpClient) {}

  async create(params: CreateTemplateParams, overrides?: RequestOverrides): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>('/v1/email-templates', params, overrides?.apiKey);
  }

  async list(params?: ListTemplatesParams, overrides?: RequestOverrides): Promise<ListTemplatesResponse> {
    return this.http.get<ListTemplatesResponse>('/v1/email-templates', params as Record<string, unknown>, overrides?.apiKey);
  }

  async *listAll(params?: Omit<ListTemplatesParams, 'page'>, overrides?: RequestOverrides): AsyncGenerator<Template> {
    let page = 1;
    const limit = params?.limit || 20;

    while (true) {
      const result = await this.list({ ...params, page, limit }, overrides);
      for (const template of result.templates) {
        yield template;
      }
      if (result.templates.length < limit) break;
      page++;
    }
  }

  async get(id: string, overrides?: RequestOverrides): Promise<TemplateResponse> {
    return this.http.get<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}`, undefined, overrides?.apiKey);
  }

  async update(id: string, params: UpdateTemplateParams, overrides?: RequestOverrides): Promise<TemplateResponse> {
    return this.http.patch<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}`, params, overrides?.apiKey);
  }

  async delete(id: string, overrides?: RequestOverrides): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`/v1/email-templates/${encodeURIComponent(id)}`, overrides?.apiKey);
  }

  async duplicate(id: string, params?: { name?: string }, overrides?: RequestOverrides): Promise<TemplateResponse> {
    return this.http.post<TemplateResponse>(`/v1/email-templates/${encodeURIComponent(id)}/duplicate`, params, overrides?.apiKey);
  }

  async preview(id: string, params?: TemplatePreviewParams, overrides?: RequestOverrides): Promise<TemplatePreviewResponse> {
    return this.http.post<TemplatePreviewResponse>(`/v1/email-templates/${encodeURIComponent(id)}/preview`, params, overrides?.apiKey);
  }

  async send(params: TemplateSendParams, overrides?: RequestOverrides): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>('/v1/email-templates/send', params, overrides?.apiKey);
  }

  async bulkSend(params: TemplateBulkSendParams, overrides?: RequestOverrides): Promise<TemplateBulkSendResponse> {
    return this.http.post<TemplateBulkSendResponse>('/v1/email-templates/bulk', params, overrides?.apiKey);
  }

  async stats(overrides?: RequestOverrides): Promise<TemplateStatsResponse> {
    return this.http.get<TemplateStatsResponse>('/v1/email-templates/stats', undefined, overrides?.apiKey);
  }
}
