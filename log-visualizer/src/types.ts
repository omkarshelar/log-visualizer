export interface Log {
    timestamp: string;
    request_path: string;
    request_method: string;
    status_code: number;
    client_ip: string;
    latency_ms: number;
    request_size: number;
    response_size: number;
    message: string;
  }
