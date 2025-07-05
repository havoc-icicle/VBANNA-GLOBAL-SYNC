import { apiService } from './api';
import { Report, ReportFilters, GenerateReportPayload } from '../types/report';

class ReportService {
  async generateReport(payload: GenerateReportPayload): Promise<{ message: string; report: Report }> {
    return apiService.post('/reports/generate', payload);
  }

  async getAllReports(params?: ReportFilters): Promise<{
    reports: Report[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiService.get('/reports', { params });
  }

  async getReportById(id: string): Promise<{ report: Report }> {
    return apiService.get(`/reports/${id}`);
  }

  async downloadReport(id: string): Promise<any> { // Returns a blob or a redirect URL
    return apiService.downloadFile(`/reports/${id}/download`);
  }
}

export const reportService = new ReportService();
