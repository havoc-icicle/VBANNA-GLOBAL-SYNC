import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Download, 
  FileText, 
  BarChart3, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { reportService } from '../services/reportService';
import { Report, GenerateReportPayload } from '../types/report';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFilters, setReportFilters] = useState({
    reportType: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data: reportsData, isLoading, error } = useQuery(
    ['reports', reportFilters],
    () => reportService.getAllReports(reportFilters),
    { keepPreviousData: true }
  );

  const generateReportMutation = useMutation(
    (payload: GenerateReportPayload) => reportService.generateReport(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reports');
        setIsGenerating(false);
        toast.success('Report generation initiated successfully!');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to initiate report generation');
        setIsGenerating(false);
      },
    }
  );

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const payload: GenerateReportPayload = {
      reportType: formData.get('reportType') as Report['reportType'],
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      format: formData.get('format') as Report['format'] || 'pdf',
      // TODO: Add more dynamic filters based on report type
      filters: {},
    };
    generateReportMutation.mutate(payload);
  };

  const handleFilterChange = (key: string, value: string) => {
    setReportFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setReportFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'info';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const reportTypes = [
    { value: 'service_progress', label: 'Service Progress' },
    { value: 'trade_lead', label: 'Trade Lead' },
    { value: 'financial', label: 'Financial' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'marketing_analytics', label: 'Marketing Analytics' },
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'json', label: 'JSON' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to load reports
        </h3>
        <p className="text-gray-500 mb-4">
          {error.message || 'An error occurred while loading reports.'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries('reports')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate and view various business reports and analytics
        </p>
      </div>

      {/* Report Generation Form */}
      {(user?.role === 'Admin') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Generate New Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <Input
                label="Report Title"
                name="title"
                placeholder="e.g., Q1 2025 Financial Summary"
                required
              />
              <Input
                label="Description (Optional)"
                name="description"
                placeholder="Brief description of the report"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  name="reportType"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select a report type</option>
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  name="format"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="pdf"
                  required
                >
                  {reportFormats.map(format => (
                    <option key={format.value} value={format.value}>{format.label}</option>
                  ))}
                </select>
              </div>
              {/* TODO: Add dynamic filter inputs based on selected reportType */}
              <Button type="submit" isLoading={generateReportMutation.isLoading} leftIcon={<BarChart3 className="w-4 h-4" />}>
                Generate Report
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters for Generated Reports */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search reports..."
              leftIcon={<Search className="w-4 h-4" />}
              value={reportFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={reportFilters.reportType}
              onChange={(e) => handleFilterChange('reportType', e.target.value)}
            >
              <option value="">All Report Types</option>
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={reportFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="generating">Generating</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setReportFilters({ reportType: '', status: '', search: '', page: 1, limit: 10 })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports ({reportsData?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!reportsData?.reports || reportsData.reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No reports found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportsData.reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        {report.description && <div className="text-sm text-gray-500">{report.description}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{report.reportType.replace('_', ' ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 uppercase">{report.format}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.generatedAt ? format(new Date(report.generatedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {report.status === 'completed' && report.filePath && (
                            <Button size="sm" variant="outline" onClick={() => reportService.downloadReport(report.id)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {/* TODO: Add view details button */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {reportsData && reportsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((reportsData.pagination.page - 1) * reportsData.pagination.limit) + 1} to{' '}
                {Math.min(reportsData.pagination.page * reportsData.pagination.limit, reportsData.pagination.total)} of{' '}
                {reportsData.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reportsData.pagination.page === 1}
                  onClick={() => handlePageChange(reportsData.pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={reportsData.pagination.page === reportsData.pagination.totalPages}
                  onClick={() => handlePageChange(reportsData.pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
