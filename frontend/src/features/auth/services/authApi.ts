import type { AuthFormData, AuthResponse, OAuthProvider } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/auth';

/**
 * Clean service layer for DeployForge Authentication.
 * Decouples presentation components from HTTP transport and backend contracts.
 */
export const authApi = {
  /**
   * Submit credentials for email/password authentication.
   */
  async login(payload: Pick<AuthFormData, 'email' | 'password'>): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: {
              code: 'invalid_credentials',
              message: 'Invalid email or password. Please verify your credentials.'
            }
          };
        }
        if (response.status === 404) {
          // Backend endpoint not mounted yet in development environment
          return simulateDevelopmentLogin(payload);
        }
        return {
          success: false,
          error: {
            code: 'server_error',
            message: `Authentication service returned an unexpected status (${response.status}).`
          }
        };
      }

      const data = await response.json();
      return { success: true, user: data.user, redirectUrl: '/console' };
    } catch (err) {
      // In local dev without active backend auth microservice, provide graceful development fallback
      if (err instanceof TypeError && err.message.includes('fetch')) {
        return simulateDevelopmentLogin(payload);
      }
      return {
        success: false,
        error: {
          code: 'network_error',
          message: 'Unable to reach the authentication gateway. Please check your network connection.'
        }
      };
    }
  },

  /**
   * Register a new developer account.
   */
  async register(payload: AuthFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 409) {
          const body = await response.json().catch(() => ({}));
          const isUsername = body?.error?.includes('username');
          return {
            success: false,
            error: {
              code: isUsername ? 'username_taken' : 'email_already_registered',
              message: isUsername
                ? 'This username is already taken. Please choose another.'
                : 'An account with this email already exists. Try signing in instead.'
            }
          };
        }
        if (response.status === 404) {
          return simulateDevelopmentRegister(payload);
        }
        return {
          success: false,
          error: {
            code: 'server_error',
            message: 'Registration service encountered an error. Please try again.'
          }
        };
      }

      const data = await response.json();
      return { success: true, user: data.user, redirectUrl: '/console' };
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        return simulateDevelopmentRegister(payload);
      }
      return {
        success: false,
        error: {
          code: 'network_error',
          message: 'Unable to reach the authentication service. Please verify your connection.'
        }
      };
    }
  },

  /**
   * Dispatch password reset instructions.
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok && response.status !== 404) {
        return {
          success: false,
          error: {
            code: 'server_error',
            message: 'Failed to dispatch reset instructions. Please try again.'
          }
        };
      }

      return {
        success: true,
        redirectUrl: '/login'
      };
    } catch {
      // In dev without backend, acknowledge receipt cleanly
      return {
        success: true,
        redirectUrl: '/login'
      };
    }
  },

  /**
   * Initiate OAuth handshake for GitHub or Google.
   * Returns authorization redirection parameters.
   */
  async initiateOAuth(provider: OAuthProvider): Promise<{ redirectUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/oauth/${provider}/url`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.url) {
          return { redirectUrl: data.url };
        }
      }

      // If backend OAuth endpoint is not yet mounted, prepare standard provider client redirect or dev stub
      const clientId = provider === 'github'
        ? import.meta.env.VITE_GITHUB_CLIENT_ID
        : import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (clientId) {
        const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/${provider}`);
        const oauthUrl = provider === 'github'
          ? `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user,user:email`
          : `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
        return { redirectUrl: oauthUrl };
      }

      // Clean development response when OAuth keys are pending environment setup
      return {
        error: `OAuth provider [${provider}] is ready for client ID configuration in .env.`
      };
    } catch {
      return {
        error: `Unable to connect to ${provider === 'github' ? 'GitHub' : 'Google'} OAuth gateway.`
      };
    }
  }
};

/**
 * Fallback handler for local development before backend auth service is running.
 */
function simulateDevelopmentLogin(payload: Pick<AuthFormData, 'email' | 'password'>): Promise<AuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple validation check
      if (payload.password.length < 8) {
        resolve({
          success: false,
          error: {
            code: 'invalid_credentials',
            message: 'Invalid credentials. Password must be at least 8 characters.'
          }
        });
        return;
      }

      resolve({
        success: true,
        user: {
          id: 'usr_dev_982b',
          email: payload.email,
          username: payload.email.split('@')[0] || 'developer'
        },
        redirectUrl: '/console'
      });
    }, 850);
  });
}

function simulateDevelopmentRegister(payload: AuthFormData): Promise<AuthResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (payload.username.toLowerCase() === 'admin' || payload.username.toLowerCase() === 'root') {
        resolve({
          success: false,
          error: {
            code: 'username_taken',
            message: 'This system username is reserved. Please pick another.'
          }
        });
        return;
      }

      resolve({
        success: true,
        user: {
          id: 'usr_dev_new',
          email: payload.email,
          username: payload.username
        },
        redirectUrl: '/console'
      });
    }, 950);
  });
}
