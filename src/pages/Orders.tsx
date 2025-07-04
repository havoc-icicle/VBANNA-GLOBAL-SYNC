import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Filter, 
  Search,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export const Orders: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', filters, user?.role],
    () => {
      if (user?.role === 'Admin') {
        return orderService.getAllOrders(filters);
      } else {
        return orderService.getUserOrders(filters);
      }
    },
    {
      enabled: !!user,
      keepPreviousData: true,
      retry: 1,
      onError: (error) => {
        console.error('Orders query error:', error);
      }
    }
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SGD',
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      case 'revised':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'rush':
        return 'warning';
      case 'standard':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
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
          Unable to load orders
        </h3>
        <p className="text-gray-500 mb-4">
          {error.message || 'An error occurred while loading your orders.'}
        </p>
        <Button onClick={() => window.location.reload()}>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'Admin' ? t('orders.allOrders') : t('orders.myOrders')}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {user?.role === 'Admin' 
              ? 'Manage all customer orders' 
              : 'Track and manage your service orders'
            }
          </p>
        </div>
        <Link to="/services">
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Browse Services
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search orders..."
              leftIcon={<Search className="w-4 h-4" />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="revised">Revised</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="standard">Standard</option>
              <option value="rush">Rush</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setFilters({
                status: '',
                priority: '',
                search: '',
                page: 1,
                limit: 10,
              })}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({ordersData?.pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!ordersData?.orders || ordersData.orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.status || filters.priority
                  ? 'Try adjusting your filters'
                  : user?.role === 'Admin'
                    ? 'No orders have been placed yet'
                    : 'You haven\'t placed any orders yet. Start by browsing our services.'
                }
              </p>
              {user?.role !== 'Admin' && (
                <Link to="/services">
                <Button>Browse Services</Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordersData?.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            {user?.role === 'Admin' && order.user && (
                              <div className="text-sm text-gray-500">
                                {order.user.firstName} {order.user.lastName}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.service?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.service?.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getPriorityBadgeVariant(order.priority)}>
                            {order.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(order.totalPrice, order.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {ordersData && ordersData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Showing {((ordersData.pagination.page - 1) * ordersData.pagination.limit) + 1} to{' '}
                    {Math.min(ordersData.pagination.page * ordersData.pagination.limit, ordersData.pagination.total)} of{' '}
                    {ordersData.pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ordersData.pagination.page === 1}
                      onClick={() => handlePageChange(ordersData.pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={ordersData.pagination.page === ordersData.pagination.totalPages}
                      onClick={() => handlePageChange(ordersData.pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};