import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  CreditCard 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { paymentService } from '../services/paymentService';
import { Invoice } from '../types/order';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const Payments: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data: invoicesData, isLoading, error } = useQuery(
    ['invoices', filters],
    () => paymentService.getInvoices(filters),
    { keepPreviousData: true }
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SGD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partially_paid': return 'info';
      case 'overdue': return 'danger';
      case 'sent': return 'warning';
      case 'draft': return 'default';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      await paymentService.generateInvoicePdf(invoiceId);
      toast.success('Invoice PDF download initiated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download invoice PDF.');
    }
  };

  // TODO: Implement actual Stripe payment integration
  const handlePayNow = (invoice: Invoice) => {
    toast.info(`Initiating payment for Invoice ${invoice.invoiceNumber}. (Stripe integration needed)`);
    // This would typically open a Stripe Elements modal or redirect to a payment page
    // For now, just log and show a toast.
    console.log('Attempting to pay invoice:', invoice);
  };

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
          Unable to load payments
        </h3>
        <p className="text-gray-500 mb-4">
          {error.message || 'An error occurred while loading payments.'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries('invoices')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your invoices and track payment statuses
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search invoices..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search} // TODO: Implement search in backend for invoices
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', search: '', page: 1, limit: 10 })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices ({invoicesData?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!invoicesData?.invoices || invoicesData.invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No invoices found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoicesData.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.orderId}</td>{/* TODO: Link to order details */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.totalAmount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link to={`/orders/${invoice.orderId}`}> {/* Link to existing order details page */}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(invoice.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          {(invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue') && (
                            <Button size="sm" onClick={() => handlePayNow(invoice)} leftIcon={<CreditCard className="w-4 h-4" />}>
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {invoicesData && invoicesData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((invoicesData.pagination.page - 1) * invoicesData.pagination.limit) + 1} to{' '}
                {Math.min(invoicesData.pagination.page * invoicesData.pagination.limit, invoicesData.pagination.total)} of{' '}
                {invoicesData.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={invoicesData.pagination.page === 1}
                  onClick={() => handlePageChange(invoicesData.pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={invoicesData.pagination.page === invoicesData.pagination.totalPages}
                  onClick={() => handlePageChange(invoicesData.pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
