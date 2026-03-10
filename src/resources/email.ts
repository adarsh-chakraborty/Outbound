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

  async send(apiKey: string, params: SendEmailParams): Promise<SendEmailResponse> {
    return this.http.post<SendEmailResponse>(apiKey, '/v1/email/send', params);
  }

  async bulk(apiKey: string, params: BulkEmailParams): Promise<BulkEmailResponse> {
    return this.http.post<BulkEmailResponse>(apiKey, '/v1/email/bulk', params);
  }

  async status(apiKey: string, jobId: string): Promise<JobStatusResponse> {
    return this.http.get<JobStatusResponse>(apiKey, `/v1/email/status/${encodeURIComponent(jobId)}`);
  }
}
