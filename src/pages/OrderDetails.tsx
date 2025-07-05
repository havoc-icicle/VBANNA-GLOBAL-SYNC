import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock,
  User,
  Package,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

export const OrderDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: orderData, isLoading, error } = useQuery(
    ['order', id],
    () => orderService.getOrderById(id!),
    {
      enabled: !!id,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !orderData?.order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Order not found
        </h3>
        <p className="text-gray-500 mb-4">
          The order you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const order = orderData.order;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              Created on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(order.status)} size="lg">
            {order.status.replace('_', ' ')}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(order.priority)} size="lg">
            {order.priority}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {order.service?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {order.service?.category} Service
                </p>
                <p className="text-gray-600 mt-2">
                  {order.service?.description}
                </p>
              </div>

              {order.service?.deliverables && order.service.deliverables.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Deliverables:</h4>
                  <ul className="space-y-1">
                    {order.service.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-start text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.requirements && Object.keys(order.requirements).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(order.requirements, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestone Tracker */}
          {order.milestones && order.milestones.length > 0 ? (
            <MilestoneTracker order={order} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Created</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  {order.startDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Work Started</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.startDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.expectedCompletionDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Expected Completion</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.expectedCompletionDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  )}

                  {order.actualCompletionDate && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Completed</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(order.actualCompletionDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">
                  {formatCurrency(order.basePrice, order.currency)}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount, order.currency)}</span>
                </div>
              )}

              {order.surcharge > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Rush Surcharge:</span>
                  <span>+{formatCurrency(order.surcharge, order.currency)}</span>
                </div>
              )}

              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">
                    {formatCurrency(order.taxAmount, order.currency)}
                  </span>
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalPrice, order.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          {order.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{order.user.role}</p>
                </div>
                {order.user.country && (
                  <div>
                    <p className="text-sm text-gray-600">Country: {order.user.country}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revision Information */}
          <Card>
            <CardHeader>
              <CardTitle>Revisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {order.revisionCount} / {order.maxRevisions}
                </div>
                <p className="text-sm text-gray-500">Revisions Used</p>
                
                {order.status === 'completed' && order.revisionCount < order.maxRevisions && (
                  <Button className="mt-3 w-full" size="sm">
                    Request Revision
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          {order.invoice && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-medium">{order.invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={order.invoice.status === 'paid' ? 'success' : 'warning'}>
                      {order.invoice.status}
                    </Badge>
                  </div>
                  {order.invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="text-sm">
                        {format(new Date(order.invoice.dueDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
                
                {order.invoice.status !== 'paid' && (
                  <Button className="w-full mt-3">
                    Pay Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/documents?orderId=${order.id}`}>
                <Button variant="outline" className="w-full" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </Link>
              
              {order.service?.category === 'Digital' && order.service.name.includes('Trade') && (
                <Link to={`/trade-leads?orderId=${order.id}`}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Package className="w-4 h-4 mr-2" />
                    View Trade Leads
                  </Button>
                </Link>
              )}
              
              <Button variant="outline" className="w-full" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};