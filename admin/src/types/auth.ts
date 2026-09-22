import type { User } from '../types';
export type { User };

export interface AuthResponse {
  success: boolean;
  message?: string;
  requires2fa?: boolean;
  twoFactorToken?: string;
  twoFactorEmail?: string;
  allowedMethods?: string[];
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Verify2faPayload {
  email?: string;
  password?: string;
  code: string;
  twoFactorToken?: string;
  method?: 'authenticator' | 'email_otp';
}
