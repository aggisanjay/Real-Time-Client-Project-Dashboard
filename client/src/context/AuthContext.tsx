import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '../types/index.js';
import { apiFetch, setAccessToken, getAccessToken } from '../services/api.js';
import { socketService } from '../services/socket.js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Attempt initial session restoration on mount via refresh cookie
  const refreshSession = useCallback(async () => {
    try {
      const res = await apiFetch<{ user: User; accessToken: string }>('/api/auth/refresh', {
        method: 'POST',
      });
      if (res && res.accessToken) {
        setAccessToken(res.accessToken);
        setUser(res.user);
        // Connect socket once authenticated
        socketService.initSocket();
      }
    } catch {
      setAccessToken(null);
      setUser(null);
      socketService.disconnect();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to custom events from api and socket services
    const handleTokenRefreshed = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
      }
    };

    const handleRoleUpdated = (e: any) => {
      if (e.detail) {
        setUser(e.detail);
        alert(`Your role was updated to: ${e.detail.role}. Your views have refreshed.`);
      }
    };

    const handleAuthRequired = () => {
      setUser(null);
      setAccessToken(null);
      socketService.disconnect();
    };

    window.addEventListener('token:refreshed', handleTokenRefreshed);
    window.addEventListener('role:updated', handleRoleUpdated);
    window.addEventListener('auth:required', handleAuthRequired);

    return () => {
      window.removeEventListener('token:refreshed', handleTokenRefreshed);
      window.removeEventListener('role:updated', handleRoleUpdated);
      window.removeEventListener('auth:required', handleAuthRequired);
    };
  }, [refreshSession]);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiFetch<{ user: User; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setAccessToken(data.accessToken);
    setUser(data.user);
    socketService.initSocket();
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      socketService.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
