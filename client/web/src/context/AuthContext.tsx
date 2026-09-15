import React, { createContext, useContext, useState, useCallback } from 'react';
import { authService, LoginResponse } from '../services/api';

interface AuthContextValue {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoginResponse | null>(() => {
    try {
      const stored = localStorage.getItem('swiftsale_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (username: string, password: string) => {
    const response = await authService.login(username, password);
    localStorage.setItem('swiftsale_token', response.token);
    localStorage.setItem('swiftsale_user', JSON.stringify(response));
    setUser(response);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('swiftsale_token');
    localStorage.removeItem('swiftsale_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'Admin',
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
