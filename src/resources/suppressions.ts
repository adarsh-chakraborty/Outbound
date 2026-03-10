import type { HttpClient } from '../http';
import type {
  ListSuppressionsParams,
  ListSuppressionsResponse,
  AddSuppressionParams,
  SuppressionResponse,
  Suppression,
} from '../types';

export class SuppressionsResource {
  constructor(private http: HttpClient) {}

  async list(apiKey: string, params?: ListSuppressionsParams): Promise<ListSuppressionsResponse> {
    return this.http.get<ListSuppressionsResponse>(apiKey, '/v1/tenants/suppressions', params as Record<string, unknown>);
  }

  async *listAll(apiKey: string, params?: Omit<ListSuppressionsParams, 'page'>): AsyncGenerator<Suppression> {
    let page = 1;
    const limit = params?.limit || 50;

    while (true) {
      const result = await this.list(apiKey, { ...params, page, limit });
      for (const suppression of result.suppressions) {
        yield suppression;
      }
      if (result.suppressions.length < limit) break;
      page++;
    }
  }

  async add(apiKey: string, params: AddSuppressionParams): Promise<SuppressionResponse> {
    return this.http.post<SuppressionResponse>(apiKey, '/v1/tenants/suppressions', params);
  }

  async remove(apiKey: string, email: string): Promise<{ message: string }> {
    return this.http.delete<{ message: string }>(apiKey, `/v1/tenants/suppressions/${encodeURIComponent(email)}`);
  }
}
