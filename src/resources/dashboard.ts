import type { HttpClient } from '../http';
import type { DashboardResponse, QuotaResponse } from '../types';

export class DashboardResource {
  constructor(private http: HttpClient) {}

  async get(apiKey: string): Promise<DashboardResponse> {
    return this.http.get<DashboardResponse>(apiKey, '/v1/tenants/dashboard');
  }

  async quota(apiKey: string): Promise<QuotaResponse> {
    return this.http.get<QuotaResponse>(apiKey, '/v1/tenants/quota');
  }
}
