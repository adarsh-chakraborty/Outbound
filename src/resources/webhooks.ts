import type { HttpClient } from '../http';
import type {
  CreateWebhookParams,
  CreateWebhookResponse,
  UpdateWebhookParams,
  UpdateWebhookResponse,
  ListWebhooksResponse,
} from '../types';

export class WebhooksResource {
  constructor(private http: HttpClient) {}

  async create(params: CreateWebhookParams): Promise<CreateWebhookResponse> {
    return this.http.post<CreateWebhookResponse>('/v1/tenants/webhooks', params);
  }

  async list(): Promise<ListWebhooksResponse> {
    return this.http.get<ListWebhooksResponse>('/v1/tenants/webhooks');
  }

  async update(id: string, params: UpdateWebhookParams): Promise<UpdateWebhookResponse> {
    return this.http.patch<UpdateWebhookResponse>(`/v1/tenants/webhooks/${encodeURIComponent(id)}`, params);
  }

  async delete(id: string): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(`/v1/tenants/webhooks/${encodeURIComponent(id)}`);
  }
}
