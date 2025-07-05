import { apiService } from './api';
import { TradeLead, TradeLeadFilters } from '../types/tradeLead';

class TradeLeadService {
  async getAllTradeLeads(params?: TradeLeadFilters): Promise<{
    tradeLeads: TradeLead[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return apiService.get('/trade-leads', { params });
  }

  async getTradeLeadById(id: string): Promise<{ tradeLead: TradeLead }> {
    return apiService.get(`/trade-leads/${id}`);
  }

  async createTradeLead(data: Partial<TradeLead>): Promise<{ message: string; tradeLead: TradeLead }> {
    return apiService.post('/trade-leads', data);
  }

  async updateTradeLead(id: string, data: Partial<TradeLead>): Promise<{ message: string; tradeLead: TradeLead }> {
    return apiService.put(`/trade-leads/${id}`, data);
  }

  async deleteTradeLead(id: string): Promise<{ message: string }> {
    return apiService.delete(`/trade-leads/${id}`);
  }

  async requestRefinement(id: string, notes: string): Promise<{ message: string; tradeLead: TradeLead }> {
    return apiService.post(`/trade-leads/${id}/refine`, { notes });
  }

  async updateTradeLeadStatus(id: string, status: 'approved' | 'rejected' | 'pending' | 'refined', vettedBy?: string, vettedAt?: string): Promise<{ message: string; tradeLead: TradeLead }> {
    return apiService.put(`/trade-leads/${id}/status`, { status, vettedBy, vettedAt });
  }
}

export const tradeLeadService = new TradeLeadService();
