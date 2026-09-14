export type AuthMode = 'login' | 'register' | 'forgot-password';

export type OAuthProvider = 'github' | 'google';

export type OAuthState = 'idle' | 'connecting' | 'redirecting' | 'error';

export interface AuthFormData {
  username: string;
  email: string;
  password: string;
}

export interface ValidationErrors {
  username?: string;
  email?: string;
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
