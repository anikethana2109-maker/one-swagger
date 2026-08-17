export interface HttpRequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  contentType?: string;
}

export interface HttpResponseResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  rawText: string;
  latencyMs: number;
  sizeBytes: number;
  timestamp: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  url: string;
  method: string;
  status: number;
  latencyMs: number;
  requestBody?: any;
  responsePreview?: string;
}
