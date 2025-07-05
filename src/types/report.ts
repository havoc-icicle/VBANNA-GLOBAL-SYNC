export interface Report {
  id: string;
  reportType: 'service_progress' | 'trade_lead' | 'financial' | 'compliance' | 'marketing_analytics';
  title: string;
  description?: string;
  generatedBy: string; // User ID
  orderId?: string;
  filters?: Record<string, any>;
  data?: Record<string, any>;
  filePath?: string;
  format: 'pdf' | 'excel' | 'json';
  status: 'generating' | 'completed' | 'failed';
  generatedAt?: string;
  expiresAt?: string;
  isScheduled: boolean;
  scheduleConfig?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  reportType?: string;
  orderId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface GenerateReportPayload {
  reportType: Report['reportType'];
  title: string;
  description?: string;
  orderId?: string;
  filters?: Record<string, any>;
  format?: Report['format'];
  isScheduled?: boolean;
  scheduleConfig?: Record<string, any>;
}
