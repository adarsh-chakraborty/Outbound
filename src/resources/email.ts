import type { HttpClient } from '../http';
import type {
  SendEmailParams,
  SendEmailResponse,
  BulkEmailParams,
  BulkEmailResponse,
  JobStatusResponse,
} from '../types';

export class EmailResource {
  constructor(private http: HttpClient) {}

  async send(params: SendEmailParams): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>('/v1/email/send', params);
  }

  async bulk(params: BulkEmailParams): Promise<BulkEmailResponse> {
    return this.http.post<BulkEmailResponse>('/v1/email/bulk', params);
  }

  async status(jobId: string): Promise<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(`/v1/email/status/${encodeURIComponent(jobId)}`);
  }
}
