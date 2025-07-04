import { apiService } from './api';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiService.post('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return apiService.post('/auth/register', data);
  }

  async getProfile(token: string): Promise<User> {
    const response = await apiService.get('/auth/profile');
    return response.user;
  }

  async updateProfile(data: Partial<User>, token: string): Promise<User> {
    const response = await apiService.put('/auth/profile', data);
    return response.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return apiService.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('token');
    // TODO: Implement server-side logout if needed
  }
}

export const authService = new AuthService();