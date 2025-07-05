import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { tradeLeadService } from '../services/tradeLeadService';
import { TradeLead } from '../types/tradeLead';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const TradeLeads: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    hsnCode: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editingLead, setEditingLead] = useState<TradeLead | null>(null);
  const [refinementNotes, setRefinementNotes] = useState<string>('');
  const [showRefinementInput, setShowRefinementInput] = useState<string | null>(null);

  const { data: tradeLeadsData, isLoading, error } = useQuery(
    ['tradeLeads', filters],
    () => tradeLeadService.getAllTradeLeads(filters),
    { keepPreviousData: true }
  );

  const createMutation = useMutation(
    (data: Partial<TradeLead>) => tradeLeadService.createTradeLead(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tradeLeads');
        setIsCreating(false);
        toast.success('Trade lead created successfully');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to create trade lead');
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: Partial<TradeLead> }) =>
      tradeLeadService.updateTradeLead(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tradeLeads');
        setEditingLead(null);
        toast.success('Trade lead updated successfully');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to update trade lead');
      },
    }
  );

  const deleteMutation = useMutation(
    (id: string) => tradeLeadService.deleteTradeLead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tradeLeads');
        toast.success('Trade lead deleted successfully');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to delete trade lead');
      },
    }
  );

  const requestRefinementMutation = useMutation(
    ({ id, notes }: { id: string; notes: string }) =>
      tradeLeadService.requestRefinement(id, notes),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tradeLeads');
        toast.success('Refinement requested successfully');
        setShowRefinementInput(null);
        setRefinementNotes('');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to request refinement');
      },
    }
  );

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'pending' | 'refined' }) =>
      tradeLeadService.updateTradeLeadStatus(id, status, user?.id, new Date().toISOString()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tradeLeads');
        toast.success('Trade lead status updated');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to update trade lead status');
      },
    }
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'refined': return 'info';
      default: return 'default';
    }
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
          Unable to load trade leads
        </h3>
        <p className="text-gray-500 mb-4">
          {error.message || 'An error occurred while loading trade leads.'}
        </p>
        <Button onClick={() => queryClient.invalidateQueries('tradeLeads')}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trade Leads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover and manage international trade opportunities
          </p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Mid-Broker') && (
          <Button onClick={() => {
            setIsCreating(true);
            setEditingLead(null);
          }} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Trade Lead
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingLead) && (
        <TradeLeadForm
          tradeLead={editingLead || undefined}
          onSave={(data) => {
            if (editingLead) updateMutation.mutate({ id: editingLead.id, data });
            else createMutation.mutate(data);
          }}
          onCancel={() => {
            setIsCreating(false);
            setEditingLead(null);
          }}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by product name or company..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <Input
              placeholder="Filter by HSN Code"
              value={filters.hsnCode}
              onChange={(e) => handleFilterChange('hsnCode', e.target.value)}
            />
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refined">Refined</option>
            </select>
            <Button
              variant="outline"
              onClick={() => setFilters({ status: '', hsnCode: '', search: '', page: 1, limit: 10 })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trade Leads List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Trade Leads ({tradeLeadsData?.pagination.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!tradeLeadsData?.tradeLeads || tradeLeadsData.tradeLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No trade leads found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refinements</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradeLeadsData.tradeLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lead.productName}</div>
                        <div className="text-sm text-gray-500">HSN: {lead.hsnCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.companyName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{lead.leadType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.country}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(lead.status)}>{lead.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lead.refinementCount} / {lead.maxRefinements}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => alert('View details for ' + lead.id)}> {/* TODO: Implement proper view details page/modal */}
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user?.role === 'End User' && lead.status !== 'approved' && lead.refinementCount < lead.maxRefinements && (
                            <Button size="sm" variant="outline" onClick={() => setShowRefinementInput(lead.id)} isLoading={requestRefinementMutation.isLoading}>
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                          )}
                          {(user?.role === 'Admin' || user?.role === 'Mid-Broker') && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setEditingLead(lead)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {user?.role === 'Admin' && (
                                <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(lead.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                              {lead.status === 'pending' && user?.role === 'Admin' && (
                                <Button size="sm" variant="success" onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'approved' })}>
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              {lead.status === 'pending' && user?.role === 'Admin' && (
                                <Button size="sm" variant="danger" onClick={() => updateStatusMutation.mutate({ id: lead.id, status: 'rejected' })}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </>
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
          {tradeLeadsData && tradeLeadsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((tradeLeadsData.pagination.page - 1) * tradeLeadsData.pagination.limit) + 1} to{' '}
                {Math.min(tradeLeadsData.pagination.page * tradeLeadsData.pagination.limit, tradeLeadsData.pagination.total)} of{' '}
                {tradeLeadsData.pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tradeLeadsData.pagination.page === 1}
                  onClick={() => handlePageChange(tradeLeadsData.pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={tradeLeadsData.pagination.page === tradeLeadsData.pagination.totalPages}
                  onClick={() => handlePageChange(tradeLeadsData.pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refinement Input */}
      {showRefinementInput && (
        <Card>
          <CardHeader>
            <CardTitle>Request Refinement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Provide notes for the refinement request for trade lead ID: {showRefinementInput}</p>
            <Input
              label="Refinement Notes"
              value={refinementNotes}
              onChange={(e) => setRefinementNotes(e.target.value)}
              placeholder="e.g., Need more leads from specific regions, refine product specifications..."
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRefinementInput(null)}>
                Cancel
              </Button>
              <Button onClick={() => requestRefinementMutation.mutate({ id: showRefinementInput, notes: refinementNotes })} isLoading={requestRefinementMutation.isLoading}>
                Submit Refinement Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface TradeLeadFormProps {
  tradeLead?: TradeLead;
  onSave: (data: Partial<TradeLead>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TradeLeadForm: React.FC<TradeLeadFormProps> = ({ tradeLead, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<Partial<TradeLead>>({
    orderId: tradeLead?.orderId || '',
    hsnCode: tradeLead?.hsnCode || '',
    productName: tradeLead?.productName || '',
    leadType: tradeLead?.leadType || 'buyer',
    companyName: tradeLead?.companyName || '',
    contactPerson: tradeLead?.contactPerson || '',
    email: tradeLead?.email || '',
    phone: tradeLead?.phone || '',
    country: tradeLead?.country || '',
    address: tradeLead?.address || '',
    priority: tradeLead?.priority || 1,
    maxRefinements: tradeLead?.maxRefinements || 1,
    // Default status to pending for new leads
    status: tradeLead?.status || 'pending',
    vetted: tradeLead?.vetted || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tradeLead ? 'Edit Trade Lead' : 'Add New Trade Lead'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Order ID"
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
            placeholder="Associated Order ID (UUID)"
            required
            disabled={!!tradeLead} // Cannot change order for existing lead
          />
          <Input
            label="Product Name"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            required
          />
          <Input
            label="HSN Code"
            value={formData.hsnCode}
            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
            placeholder="e.g., 85176200"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Type</label>
            <select
              value={formData.leadType}
              onChange={(e) => setFormData({ ...formData, leadType: e.target.value as 'buyer' | 'seller' })}
              className="block w-full rounded-md border-gray-300 shadow-sm"
              required
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>
          <Input
            label="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            required
          />
          <Input
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone (Optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <Input
            label="Priority (1-5, 1 being highest)"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            min={1}
            max={5}
          />
          <Input
            label="Max Refinements"
            type="number"
            value={formData.maxRefinements}
            onChange={(e) => setFormData({ ...formData, maxRefinements: parseInt(e.target.value) || 1 })}
            min={0}
          />

          {tradeLead && user?.role === 'Admin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TradeLead['status'] })}
                  className="block w-full rounded-md border-gray-300 shadow-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="refined">Refined</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vetted"
                  checked={formData.vetted}
                  onChange={(e) => setFormData({ ...formData, vetted: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="vetted" className="ml-2 text-sm text-gray-700">
                  Vetted
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Trade Lead
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
