import { apiService } from './api';
import { Invoice, Payment } from '../types/order'; // Assuming Invoice and Payment types are in order.ts

export interface CreatePaymentIntentPayload {
  orderId: string;
  amount: number;
  currency: string;
  isPartialPayment?: boolean;
  paymentScheduleIndex?: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

class PaymentService {
  async getInvoices(params?: { status?: string; page?: number; limit?: number }): Promise<{
    invoices: Invoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiService.get('/payments/invoices', { params });
  }

  async getInvoiceById(id: string): Promise<{ invoice: Invoice }> {
    return apiService.get(`/payments/invoices/${id}`);
  }

  async getPaymentsByOrder(orderId: string): Promise<{ payments: Payment[] }> {
    return apiService.get(`/payments/order/${orderId}`);
  }

  async createPaymentIntent(payload: CreatePaymentIntentPayload): Promise<CreatePaymentIntentResponse> {
    return apiService.post('/payments/create-payment-intent', payload);
  }

  async generateInvoicePdf(invoiceId: string): Promise<void> {
    return apiService.downloadFile(`/payments/invoices/${invoiceId}/pdf`);
  }
}

export const paymentService = new PaymentService();
