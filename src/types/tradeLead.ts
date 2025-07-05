export interface TradeLead {
  id: string;
  orderId: string;
  hsnCode: string;
  productName: string;
  leadType: 'buyer' | 'seller';
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  tradeHistory?: Record<string, any>;
  complianceStatus?: Record<string, any>;
  outreachTemplates?: any[];
  status: 'pending' | 'approved' | 'rejected' | 'refined';
  vetted: boolean;
  vettedBy?: string;
  vettedAt?: string;
  marketData?: Record<string, any>;
  priority: number;
  refinementCount: number;
  maxRefinements: number;
  createdAt: string;
  updatedAt: string;
}

export interface TradeLeadFilters {
  hsnCode?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
