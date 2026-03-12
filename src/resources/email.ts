import type { HttpClient } from '../http';
import type {
  SendEmailParams,
  SendEmailResponse,
  BulkEmailParams,
  BulkEmailResponse,
  JobStatusResponse,
  RequestOverrides,
} from '../types';

export class EmailResource {
  constructor(private http: HttpClient) {}

  async send(params: SendEmailParams, overrides?: RequestOverrides): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>('/v1/email/send', params, overrides?.apiKey);
  }

  async bulk(params: BulkEmailParams, overrides?: RequestOverrides): Promise<BulkEmailResponse> {
    return this.http.post<BulkEmailResponse>('/v1/email/bulk', params, overrides?.apiKey);
  }

  async status(jobId: string, overrides?: RequestOverrides): Promise<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(`/v1/email/status/${encodeURIComponent(jobId)}`, undefined, overrides?.apiKey);
  }
}
