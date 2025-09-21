import api from '../api';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User
} from './types';

class AuthService {

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }


  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ message: string }> {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      console.error('Logout error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Logout failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/refresh');
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Token refresh failed');
    }
  }

  /**
   * Get current user profile (if you have this endpoint)
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get user data');
    }
  }

  /**
   * Check if user is authenticated by trying to refresh token
   */
  async checkAuth(): Promise<User | null> {
    try {
      const response = await this.refreshToken();
      return response.user;
    } catch (error) {
      console.log('User not authenticated');
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;