import { supabase } from '../config/database.js';

const generateOrderNumber = async () => {
  const prefix = 'VBG';
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Find the last order number for today
  const datePrefix = `${prefix}${year}${month}${day}`;
  
  // Use Supabase to find the last order
  const { data: lastOrders } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `${datePrefix}%`)
    .order('order_number', { ascending: false })
    .limit(1);
  
  let sequence = '001';
  
  if (lastOrders && lastOrders.length > 0) {
    const lastSequence = lastOrders[0].order_number.slice(-3);
    const nextSequence = parseInt(lastSequence) + 1;
    sequence = nextSequence.toString().padStart(3, '0');
  }
  
  return `${datePrefix}${sequence}`;
};

const calculateDeliveryDate = (startDate, turnaroundDays, excludeWeekends = true) => {
  const deliveryDate = new Date(startDate);
  let daysToAdd = turnaroundDays;
  
  if (excludeWeekends) {
    // Add business days only (exclude weekends)
    while (daysToAdd > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      
      // Check if it's a weekday (0 = Sunday, 6 = Saturday)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysToAdd--;
      }
    }
  } else {
    // Add calendar days
    deliveryDate.setDate(deliveryDate.getDate() + turnaroundDays);
  }
  
  return deliveryDate;
};

const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: '#FFA500',     // Orange
    in_progress: '#007BFF', // Blue
    completed: '#28A745',   // Green
    revised: '#6F42C1',     // Purple
    cancelled: '#DC3545'    // Red
  };
  
  return statusColors[status] || '#6C757D'; // Default gray
};

const getOrderPriorityLevel = (priority) => {
  const priorityLevels = {
    standard: 1,
    rush: 2,
    urgent: 3
  };
  
  return priorityLevels[priority] || 1;
};

const formatOrderSummary = (order) => {
  return {
    orderNumber: order.order_number || order.orderNumber,
    serviceName: order.service?.name || 'Unknown Service',
    status: order.status,
    priority: order.priority,
    totalPrice: order.total_price || order.totalPrice,
    currency: order.currency,
    createdAt: order.created_at || order.createdAt,
    expectedCompletionDate: order.expected_completion_date || order.expectedCompletionDate,
    actualCompletionDate: order.actual_completion_date || order.actualCompletionDate,
    revisionCount: order.revision_count || order.revisionCount,
    maxRevisions: order.max_revisions || order.maxRevisions
  };
};

export {
  generateOrderNumber,
  calculateDeliveryDate,
  getOrderStatusColor,
  getOrderPriorityLevel,
  formatOrderSummary
};