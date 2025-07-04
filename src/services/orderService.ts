import { apiService } from './api';
import { Order, OrderFilters } from '../types/order';
import { ServiceRequest } from '../types/service';

class OrderService {
  async createOrder(data: ServiceRequest): Promise<{
    message: string;
    order: Order;
  }> {
    return apiService.post('/orders', data);
  }

  async getUserOrders(params?: OrderFilters): Promise<{
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiService.get('/orders/my-orders', { params });
  }

  async getAllOrders(params?: OrderFilters): Promise<{
    orders: Order[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiService.get('/orders/all', { params });
  }

  async getOrderById(id: string): Promise<{ order: Order }> {
    return apiService.get(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<{
    message: string;
    order: Order;
  }> {
    return apiService.put(`/orders/${id}/status`, { status, notes });
  }

  async requestRevision(id: string, revisionNotes: string): Promise<{
    message: string;
    order: Order;
  }> {
    return apiService.post(`/orders/${id}/revision`, { revisionNotes });
  }
}

export const orderService = new OrderService();