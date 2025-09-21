// Auth API Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken?: string;
}

export interface ErrorResponse {
  error: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}