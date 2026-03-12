import type { HttpClient } from '../http';
import type {
  CreateWebhookParams,
  CreateWebhookResponse,
  UpdateWebhookParams,
  UpdateWebhookResponse,
  ListWebhooksResponse,
  RequestOverrides,
} from '../types';

export class WebhooksResource {
  constructor(private http: HttpClient) {}

  async create(params: CreateWebhookParams, overrides?: RequestOverrides): Promise<CreateWebhookResponse> {
    return this.http.post<CreateWebhookResponse>('/v1/tenants/webhooks', params, overrides?.apiKey);
  }

  async list(overrides?: RequestOverrides): Promise<ListWebhooksResponse> {
    return this.http.get<ListWebhooksResponse>('/v1/tenants/webhooks', undefined, overrides?.apiKey);
  }

  async update(id: string, params: UpdateWebhookParams, overrides?: RequestOverrides): Promise<UpdateWebhookResponse> {
    return this.http.patch<UpdateWebhookResponse>(`/v1/tenants/webhooks/${encodeURIComponent(id)}`, params, overrides?.apiKey);
  }

  async delete(id: string, overrides?: RequestOverrides): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`/v1/tenants/webhooks/${encodeURIComponent(id)}`, overrides?.apiKey);
  }
}
