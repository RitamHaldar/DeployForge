import axios from "axios";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "../types";

const api = axios.create({
  baseURL: "/api/auth",
  withCredentials: true
})

export async function LoginApi(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      body?: { user: AuthUser };
    }>("/login", payload);
    return {
      success: true,
      user: response.data.body?.user,
      redirectUrl: '/console',
    };
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: err.response?.status === 401 ? 'invalid_credentials' : 'server_error',
        message: err.response?.data?.message || 'Invalid email or password. Please try again.',
      },
    };
  }
}

export async function RegisterApi(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const response = await api.post<{ success: boolean; message: string; body?: { user: AuthUser } }>("/register", {
      payload
    })
    return response.data;
  }
  catch (err: any) {
    return {
      success: false,
      error: {
        code: err.response?.status === 400 ? 'email_already_registered' : 'server_error',
        message: err.response?.data?.message || 'Registration failed. Please verify your details.',
      },
    };
  }
}

export async function GetUserApi(): Promise<AuthUser | null> {
  try {
    const response = await api.get<{ success: boolean; body?: { user: AuthUser } }>('/get-user');
    return response.data.body?.user ?? null;
  } catch {
    return null;
  }
}

export async function RequestPasswordResetApi(email: string): Promise<AuthResponse> {
  try {
    await api.post('/forgot-password', { email });
    return { success: true, redirectUrl: '/login' };
  } catch {
    return { success: true, redirectUrl: '/login' };
  }
}

export async function InitiateOAuthApi(provider: 'github' | 'google'): Promise<{ redirectUrl?: string; error?: string }> {
  try {
    if (provider === 'github') {
      return { redirectUrl: '/api/auth/github' };
    }
    return { redirectUrl: '/api/auth/google' };
  } catch {
    return { error: `Unable to connect to ${provider} OAuth gateway.` };
  }
}

export const authApi = {
  login: LoginApi,
  register: RegisterApi,
  getUser: GetUserApi,
  requestPasswordReset: RequestPasswordResetApi,
  initiateOAuth: InitiateOAuthApi,
};
