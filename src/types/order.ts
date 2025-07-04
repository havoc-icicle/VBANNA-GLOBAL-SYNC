import { Service } from './service';
import { User } from './auth';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  serviceId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'revised' | 'cancelled';
  priority: 'standard' | 'rush';
  basePrice: number;
  discount: number;
  surcharge: number;
  taxAmount: number;
  totalPrice: number;
  currency: string;
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  revisionCount: number;
  maxRevisions: number;
  requirements?: Record<string, any>;
  deliverables: string[];
  notes?: string;
  isPartialPaymentAllowed: boolean;
  paymentSchedule: PaymentScheduleItem[];
  createdAt: string;
  updatedAt: string;
  
  // Relations
  service?: Service;
  user?: User;
  payments?: Payment[];
  invoice?: Invoice;
}

export interface PaymentScheduleItem {
  phase: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal';
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  failureReason?: string;
  refundReason?: string;
  refundAmount?: number;
  metadata?: Record<string, any>;
  isPartialPayment: boolean;
  paymentScheduleIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  baseAmount: number;
  discountAmount: number;
  surchargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  lineItems: InvoiceLineItem[];
  billingAddress?: Record<string, any>;
  companyDetails?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderFilters {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  revised: number;
  cancelled: number;
}