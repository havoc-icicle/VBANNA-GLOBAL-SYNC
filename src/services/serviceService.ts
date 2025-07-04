import { apiService } from './api';
import { Service } from '../types/service';

class ServiceService {
  async getAllServices(params?: { category?: string; isActive?: boolean }): Promise<{
    services: Service[];
    total: number;
  }> {
    return apiService.get('/services', { params });
  }

  async getServiceById(id: string): Promise<{ service: Service }> {
    return apiService.get(`/services/${id}`);
  }

  async getServicesByCategory(category: 'Documentation' | 'Digital'): Promise<{
    category: string;
    services: Service[];
    total: number;
  }> {
    return apiService.get(`/services/category/${category}`);
  }

  async createService(data: Partial<Service>): Promise<{
    message: string;
    service: Service;
  }> {
    return apiService.post('/services', data);
  }

  async updateService(id: string, data: Partial<Service>): Promise<{
    message: string;
    service: Service;
  }> {
    return apiService.put(`/services/${id}`, data);
  }

  async deleteService(id: string): Promise<{ message: string }> {
    return apiService.delete(`/services/${id}`);
  }
}

export const serviceService = new ServiceService();