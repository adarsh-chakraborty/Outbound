import type { HttpClient } from '../http';
import type { DashboardResponse, QuotaResponse } from '../types';

export class DashboardResource {
  constructor(private http: HttpClient) {}

  async get(): Promise<DashboardResponse> {
    return this.http.get<DashboardResponse>('/v1/tenants/dashboard');
  }

  async quota(): Promise<QuotaResponse> {
    return this.http.get<QuotaResponse>('/v1/tenants/quota');
  }
}
