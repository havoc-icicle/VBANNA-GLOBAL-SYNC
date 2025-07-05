export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'End User' | 'Mid-Broker';
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
  isActive: boolean;
  lastLogin?: string;
  twoFactorEnabled: boolean;
  onboarding_status?: 'pending' | 'completed' | 'skipped';
  referredByPartnerId?: string;
  partnerSpecificMetadata?: Record<string, any>;
  referralCode?: string;
  partnerType?: string;
  complianceStatus?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'End User' | 'Mid-Broker';
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
  referralCode?: string;
  partnerType?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}