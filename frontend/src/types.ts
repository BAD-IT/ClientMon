export interface ProcessSummary {
  pid: number;
  name: string;
  memory_mb: number;
  cpu_percent: number;
  network_count: number;
  is_user_app?: boolean;
}

export interface NetworkActivity {
  remote_address: string;
  port: number;
  status: string;
  protocol: string;
}

export interface FileAccess {
  path: string;
  mode: string;
}

export interface ProcessDetails extends ProcessSummary {
  path: string;
  network_activities: NetworkActivity[];
  unique_file_paths: FileAccess[];
  error?: string;
}

export interface Alert {
  type: string;
  severity: string;
  message: string;
  pid?: number;
  process_name?: string;
  remote_ip?: string;
}
