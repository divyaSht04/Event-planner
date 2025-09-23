import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import type { AuthContextType, AuthState, User, RegisterRequest } from '../services';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, 
  error: null,
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const clearError = () => {
    updateState({ error: null });
  };

  const setUser = (user: User | null) => {
    updateState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authService.login({ email, password });
      setUser(response.user);
      
      console.log('Login successful:', response.message);
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || 'Login failed',
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await authService.register(data);
      setUser(response.user);
      
      console.log('Registration successful:', response.message);
    } catch (error: any) {
      updateState({
        isLoading: false,
        error: error.message || 'Registration failed',
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      setUser(response.user);
    } catch (error: any) {
      console.log('Token refresh failed:', error.message);
      setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        updateState({ isLoading: true });
        
        const user = await authService.checkAuth();
        setUser(user);
      } catch (error) {
        console.log('No existing authentication found');
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);


  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export context for advanced usage
export default AuthContext;