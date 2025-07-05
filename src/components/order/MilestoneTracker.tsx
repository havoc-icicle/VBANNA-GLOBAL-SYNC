import React from 'react';
import { CheckCircle, Clock, FastForward, XCircle } from 'lucide-react';
import { Order, OrderMilestone } from '../../types/order';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from 'react-query';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';

interface MilestoneTrackerProps {
  order: Order;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ order }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateMilestoneMutation = useMutation(
    ({ orderId, newMilestone }: { orderId: string; newMilestone: string }) =>
      orderService.updateOrderMilestone(orderId, newMilestone),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['order', order.id]);
        toast.success('Milestone updated successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update milestone.');
      },
    }
  );

  const handleMilestoneUpdate = (newMilestone: string) => {
    if (user?.role === 'Admin') {
      updateMilestoneMutation.mutate({ orderId: order.id, newMilestone });
    } else {
      toast.error('You do not have permission to update milestones.');
    }
  };

  const getMilestoneIcon = (status: OrderMilestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <FastForward className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getMilestoneStatusText = (milestone: OrderMilestone) => {
    if (milestone.status === 'completed') {
      return `Completed on ${format(new Date(milestone.completion_date!), 'MMM dd, yyyy')}`;
    } else if (milestone.status === 'in_progress') {
      return 'In Progress';
    } else {
      return 'Pending';
    }
  };

  const calculateProgressPercentage = () => {
    if (!order.milestones || order.milestones.length === 0) return 0;
    const completedMilestones = order.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / order.milestones.length) * 100);
  };

  const progressPercentage = calculateProgressPercentage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progressPercentage}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-6">
          {order.milestones.length === 0 && (
            <div className="text-center text-gray-500">
              No specific milestones defined for this service yet.
            </div>
          )}
          {order.milestones.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getMilestoneIcon(milestone.status)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                <p className="text-sm text-gray-600">{milestone.description}</p>
                <p className="text-xs text-gray-500">{getMilestoneStatusText(milestone)}</p>
                {user?.role === 'Admin' && milestone.status !== 'completed' && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMilestoneUpdate(milestone.name)}
                      isLoading={updateMilestoneMutation.isLoading}
                    >
                      Mark as Current
                    </Button>
                    {/* TODO: Add functionality to mark as completed with date */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {user?.role === 'Admin' && order.milestones.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Current Milestone: {order.currentMilestone || 'N/A'}</h4>
            {/* TODO: Add a dropdown or input for admin to select/set current milestone */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
