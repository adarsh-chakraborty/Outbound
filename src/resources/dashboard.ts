import type { HttpClient } from '../http';
import type { DashboardResponse, QuotaResponse, RequestOverrides } from '../types';

export class DashboardResource {
  constructor(private http: HttpClient) {}

  async get(overrides?: RequestOverrides): Promise<DashboardResponse> {
    return this.http.get<DashboardResponse>('/v1/tenants/dashboard', undefined, overrides?.apiKey);
  }

  async quota(overrides?: RequestOverrides): Promise<QuotaResponse> {
    return this.http.get<QuotaResponse>('/v1/tenants/quota', undefined, overrides?.apiKey);
  }
}
