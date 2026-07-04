import { apiClient } from './api-client';

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  workspaceName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface InviteRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface AcceptInviteRequest {
  token: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  workspaces: Workspace[];
}

export interface Workspace {
  id: string;
  slug: string;
  name: string;
  role: string;
}

export interface SignupResponse {
  user: User;
  workspace: Workspace;
  tokens: TokenResponse;
}

export interface LoginResponse {
  tokens: TokenResponse;
}

export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  current: boolean;
}

export interface SessionsResponse {
  items: Session[];
}

export interface InviteResponse {
  inviteId: string;
}

export interface AcceptInviteResponse {
  workspaceId: string;
  tokens?: TokenResponse;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiClient.post('/auth/signup', data, { skipAuth: true });
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/auth/login', data, { skipAuth: true });
  },

  async refresh(data: RefreshRequest): Promise<TokenResponse> {
    return apiClient.post('/auth/refresh', data, { skipAuth: true });
  },

  async logout(data: LogoutRequest): Promise<void> {
    return apiClient.post('/auth/logout', data);
  },

  async logoutAll(): Promise<{ revoked: number }> {
    return apiClient.post('/auth/logout-all', {});
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ status: string }> {
    return apiClient.post('/auth/forgot-password', data, { skipAuth: true });
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ status: string }> {
    return apiClient.post('/auth/reset-password', data, { skipAuth: true });
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<{ status: string }> {
    return apiClient.post('/auth/verify-email', data, { skipAuth: true });
  },

  async resendVerification(): Promise<{ status: string }> {
    return apiClient.post('/auth/resend-verification');
  },

  async getMe(): Promise<User> {
    return apiClient.get('/auth/me');
  },

  async getSessions(): Promise<SessionsResponse> {
    return apiClient.get('/auth/sessions');
  },

  async deleteSession(sessionId: string): Promise<void> {
    return apiClient.delete(`/auth/sessions/${sessionId}`);
  },

  async createInvite(data: InviteRequest, workspaceId: string): Promise<InviteResponse> {
    return apiClient.post('/auth/invites', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
  },

  async acceptInvite(data: AcceptInviteRequest): Promise<AcceptInviteResponse> {
    // New users (with password) skip auth — they don't have a token yet.
    // Existing users (no password) must send their Bearer token.
    return apiClient.post('/auth/accept-invite', data, { skipAuth: !!data.password });
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put('/auth/me', data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ status: string }> {
    return apiClient.post('/auth/change-password', data);
  },
};
