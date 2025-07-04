import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { serviceService } from '../services/serviceService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Fetch user's recent orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'user-orders',
    () => {
      // Dashboard always shows user's own orders, regardless of role
      return orderService.getUserOrders({ limit: 5 });
    },
    {
      enabled: !!user,
      retry: 1,
      onError: (error) => {
        console.error('Dashboard orders error:', error);
      }
    }
  );

  // Fetch services for quick actions
  const { data: servicesData, isLoading: servicesLoading } = useQuery(
    'services',
    () => serviceService.getAllServices({ isActive: true }),
    {
      enabled: !!user,
    }
  );

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
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SGD',
    }).format(amount);
  };

  // Calculate stats from orders
  const orderStats = ordersData?.orders.reduce(
    (acc, order) => {
      acc.total += 1;
      acc.totalValue += order.totalPrice;
      
      switch (order.status) {
        case 'pending':
          acc.pending += 1;
          break;
        case 'in_progress':
          acc.inProgress += 1;
          break;
        case 'completed':
          acc.completed += 1;
          break;
      }
      
      return acc;
    },
    { total: 0, pending: 0, inProgress: 0, completed: 0, totalValue: 0 }
  ) || { total: 0, pending: 0, inProgress: 0, completed: 0, totalValue: 0 };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome')}, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Manage your global business formation services and track progress in real-time.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.inProgress}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{orderStats.completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(orderStats.totalValue, 'SGD')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
              <Link to="/orders">
                <Button variant="outline" size="sm">
                  {t('dashboard.viewAll')}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : ordersData?.orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No orders yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start by requesting a service to see your orders here
                </p>
                <Link to="/services" className="mt-2 inline-block">
                  <Button size="sm">Browse Services</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {ordersData?.orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {order.service?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.orderNumber}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalPrice, order.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/services">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Browse All Services
                  </Button>
                </Link>
                
                {servicesData?.services.slice(0, 4).map((service) => (
                  <Link
                    key={service.id}
                    to={`/questionnaire/${service.id}`}
                  >
                    <Button className="w-full justify-start" variant="ghost">
                      <Plus className="w-4 h-4 mr-2" />
                      Request {service.name}
                    </Button>
                  </Link>
                ))}
                
                <Link to="/documents">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </Link>
                
                <Link to="/trade-leads">
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Trade Leads
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {orderStats.pending > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              {t('dashboard.pendingTasks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                You have {orderStats.pending} pending order{orderStats.pending > 1 ? 's' : ''} 
                that require your attention.
              </p>
              <Link to="/orders?status=pending" className="mt-2 inline-block">
                <Button size="sm" variant="outline">
                  Review Pending Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};