"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';
import { authService, User, TokenResponse, SignupRequest, LoginRequest } from './auth-service';
import { tokenManager } from './token-manager';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest, redirectTo?: string) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  storeTokensAndUser: (tokens: TokenResponse) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const refreshTime = tokenManager.getRefreshTime(expiresIn);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return;

      try {
        const tokens = await authService.refresh({ refreshToken });
        setAccessToken(tokens.accessToken);
        apiClient.setAccessToken(tokens.accessToken);
        tokenManager.setTokens(tokens);
        setTokenExpiresAt(Date.now() + tokens.expiresIn * 1000);
        scheduleTokenRefresh(tokens.expiresIn);
      } catch (error) {
        console.error('Token refresh failed:', error);
        await handleLogout();
      }
    }, refreshTime);
  }, []);

  const handleLogout = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    setUser(null);
    setAccessToken(null);
    setTokenExpiresAt(null);
    apiClient.setAccessToken(null);
    tokenManager.clearTokens();
    router.push('/signin');
  }, [router]);

  const setTokens = useCallback((tokens: TokenResponse) => {
    setAccessToken(tokens.accessToken);
    apiClient.setAccessToken(tokens.accessToken);
    tokenManager.setTokens(tokens);
    setTokenExpiresAt(Date.now() + tokens.expiresIn * 1000);
    scheduleTokenRefresh(tokens.expiresIn);
  }, [scheduleTokenRefresh]);

  const login = useCallback(async (data: LoginRequest, redirectTo?: string) => {
    const response = await authService.login(data);
    // Handle both { tokens } and direct tokens response
    const tokens = response.tokens || response;
    if (!tokens?.accessToken) {
      throw new Error('Invalid login response');
    }
    setTokens(tokens);
    const userData = await authService.getMe();
    setUser(userData);
    router.push(redirectTo || '/home');
  }, [setTokens, router]);

  const storeTokensAndUser = useCallback(async (tokens: TokenResponse) => {
    setTokens(tokens);
    const userData = await authService.getMe();
    setUser(userData);
  }, [setTokens]);

  const signup = useCallback(async (data: SignupRequest) => {
    const response = await authService.signup(data);
    setTokens(response.tokens);
    setUser(response.user);
    router.push('/home');
  }, [setTokens, router]);

  const logout = useCallback(async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      try {
        await authService.logout({ refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    await handleLogout();
  }, [handleLogout]);

  const refreshUser = useCallback(async () => {
    if (!accessToken) return;
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [accessToken]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const tokens = await authService.refresh({ refreshToken });
        setTokens(tokens);
        const userData = await authService.getMe();
        setUser(userData);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setTokens]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
    storeTokensAndUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
