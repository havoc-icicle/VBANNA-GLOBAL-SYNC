export interface Service {
  id: string;
  name: string;
  category: 'Documentation' | 'Digital';
  description?: string;
  deliverables: string[];
  revisionPolicy: number;
  standardTurnaroundDays: number;
  rushTurnaroundDays?: number;
  priceMin: number;
  priceMax: number;
  currency: string;
  rushSurchargePercent?: number;
  isActive: boolean;
  features: string[];
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  name: string;
  description: string;
  services: Service[];
}

export interface ServiceRequest {
  serviceId: string;
  priority: 'standard' | 'rush';
  requirements?: Record<string, any>;
  isPartialPaymentAllowed?: boolean;
  paymentSchedule?: PaymentScheduleItem[];
}

export interface PaymentScheduleItem {
  phase: string;
  percentage: number;
  amount: number;
  description: string;
}