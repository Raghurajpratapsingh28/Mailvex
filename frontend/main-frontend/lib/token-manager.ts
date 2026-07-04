import { TokenResponse } from './auth-service';

const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenManager = {
  // Access token is stored in memory only (via auth context)
  // Refresh token is stored in localStorage (simulating httpOnly cookie for demo)
  
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setTokens(tokens: TokenResponse): void {
    this.setRefreshToken(tokens.refreshToken);
  },

  clearTokens(): void {
    this.removeRefreshToken();
  },

  // Calculate when to refresh (5 minutes before expiry)
  getRefreshTime(expiresIn: number): number {
    const bufferSeconds = 300; // 5 minutes
    return (expiresIn - bufferSeconds) * 1000;
  },

  isTokenExpiringSoon(expiresAt: number): boolean {
    const bufferMs = 300000; // 5 minutes
    return Date.now() >= expiresAt - bufferMs;
  },
};
