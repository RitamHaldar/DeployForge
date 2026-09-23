export type AuthMode = 'login' | 'register' | 'forgot-password';

export type OAuthProvider = 'github' | 'google';

export type OAuthState = 'idle' | 'connecting' | 'redirecting' | 'error';

export const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'US/CA' },
  { code: '+91', flag: '🇮🇳', name: 'IN' },
  { code: '+44', flag: '🇬🇧', name: 'UK' },
  { code: '+49', flag: '🇩🇪', name: 'DE' },
  { code: '+81', flag: '🇯🇵', name: 'JP' },
  { code: '+33', flag: '🇫🇷', name: 'FR' },
  { code: '+61', flag: '🇦🇺', name: 'AU' },
  { code: '+65', flag: '🇸🇬', name: 'SG' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
] as const;

export interface AuthFormData {
  username: string;
  email: string;
  password: string;
  mobileNumber?: string;
  countryCode?: string;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  mobile?: {
    Number: string;
    CountryCode: string;
  };
}

export interface ValidationErrors {
  username?: string;
  email?: string;
  mobile?: string;
  password?: string;
  general?: string;
}

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'strong' | 'excellent';

export interface PasswordStrengthInfo {
  score: number; // 0 to 4
  level: PasswordStrengthLevel;
  label: string;
  activeBars: number;
}

export type SubmitStatus = 'idle' | 'loading' | 'success' | 'redirecting' | 'error';

export interface AuthApiError {
  code:
    | 'invalid_credentials'
    | 'invalid_email'
    | 'username_taken'
    | 'email_already_registered'
    | 'oauth_cancelled'
    | 'oauth_failed'
    | 'network_error'
    | 'server_error'
    | 'session_expired';
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: AuthApiError;
  redirectUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: AuthApiError | string | null;
}

export interface GitResponse {
  id: string | number;
  name: string;
  fullName: string;
  private: boolean | string;
  cloneUrl: string;
  defaultBranch: string;
}