import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; role?: string; dob?: string; gender?: string; height?: number; weight?: number }) => Promise<void>;
  logout: () => void;
  isPatient: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('healthguard_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('healthguard_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('healthguard_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; role?: string; dob?: string; gender?: string; height?: number; weight?: number }) => {
    const res = await authAPI.register(data);
    localStorage.setItem('healthguard_token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('healthguard_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isPatient: user?.role === 'USER',
        isDoctor: user?.role === 'DOCTOR',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
