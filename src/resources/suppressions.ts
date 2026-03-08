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

  async list(params?: ListSuppressionsParams): Promise<ListSuppressionsResponse> {
    return this.http.get<ListSuppressionsResponse>('/v1/tenants/suppressions', params as Record<string, unknown>);
  }

  async *listAll(params?: Omit<ListSuppressionsParams, 'page'>): AsyncGenerator<Suppression> {
    let page = 1;
    const limit = params?.limit || 50;

    while (true) {
      const result = await this.list({ ...params, page, limit });
      for (const suppression of result.suppressions) {
        yield suppression;
      }
      if (result.suppressions.length < limit) break;
      page++;
    }
  }

  async add(params: AddSuppressionParams): Promise<SuppressionResponse> {
    return this.http.post<SuppressionResponse>('/v1/tenants/suppressions', params);
  }

  async remove(email: string): Promise<{ message: string }> {
    return this.http.delete<{ message: string }>(`/v1/tenants/suppressions/${encodeURIComponent(email)}`);
  }
}
