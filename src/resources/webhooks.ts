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

  async create(apiKey: string, params: CreateWebhookParams): Promise<CreateWebhookResponse> {
    return this.http.post<CreateWebhookResponse>(apiKey, '/v1/tenants/webhooks', params);
  }

  async list(apiKey: string): Promise<ListWebhooksResponse> {
    return this.http.get<ListWebhooksResponse>(apiKey, '/v1/tenants/webhooks');
  }

  async update(apiKey: string, id: string, params: UpdateWebhookParams): Promise<UpdateWebhookResponse> {
    return this.http.patch<UpdateWebhookResponse>(apiKey, `/v1/tenants/webhooks/${encodeURIComponent(id)}`, params);
  }

  async delete(apiKey: string, id: string): Promise<{ message: string; id: string }> {
    return this.http.delete<{ message: string; id: string }>(apiKey, `/v1/tenants/webhooks/${encodeURIComponent(id)}`);
  }
}
