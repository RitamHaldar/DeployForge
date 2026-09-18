import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type {
  AuthMode,
  AuthFormData,
  ValidationErrors,
  PasswordStrengthInfo,
  SubmitStatus,
  OAuthProvider,
  OAuthState
} from '../types';
import { authApi } from '../services/authApi';
import { setLoading, setError, setUser } from '../auth.slice';

function getPasswordStrength(val: string): PasswordStrengthInfo {
  if (!val) {
    return { score: 0, level: 'empty', label: 'Empty', activeBars: 0 };
  }

  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 10) score++;
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (score === 0 || val.length < 6) {
    return { score: 1, level: 'weak', label: 'Weak', activeBars: 1 };
  }
  if (score <= 2) {
    return { score: 2, level: 'fair', label: 'Fair', activeBars: 2 };
  }
  if (score === 3) {
    return { score: 3, level: 'strong', label: 'Strong', activeBars: 3 };
  }
  return { score: 4, level: 'excellent', label: 'Excellent', activeBars: 4 };
}

export function useAuthForm(mode: AuthMode = 'login') {
  const dispatch = useDispatch();

  // Form State
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Integrated OAuth State
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [providerStates, setProviderStates] = useState<Record<OAuthProvider, OAuthState>>({
    github: 'idle',
    google: 'idle'
  });
  const [oauthError, setOauthError] = useState<string | null>(null);
  const oauthTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (oauthTimeoutRef.current) {
        window.clearTimeout(oauthTimeoutRef.current);
      }
    };
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);

  const setFieldValue = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const setFieldTouched = (_field: keyof AuthFormData) => {};

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const clearOAuthError = () => {
    setOauthError(null);
  };

  const connectOAuth = async (provider: OAuthProvider) => {
    if (activeProvider !== null || submitStatus === 'loading') return;

    setOauthError(null);
    setErrors({});
    setActiveProvider(provider);
    setProviderStates(prev => ({ ...prev, [provider]: 'connecting' }));

    try {
      const result = await authApi.initiateOAuth(provider);

      if (result.redirectUrl) {
        setProviderStates(prev => ({ ...prev, [provider]: 'redirecting' }));
        oauthTimeoutRef.current = window.setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 400);
      } else if (result.error) {
        setProviderStates(prev => ({ ...prev, [provider]: 'error' }));
        setOauthError(result.error);
        oauthTimeoutRef.current = window.setTimeout(() => {
          setProviderStates(prev => ({ ...prev, [provider]: 'idle' }));
          setActiveProvider(null);
        }, 3200);
      }
    } catch {
      setProviderStates(prev => ({ ...prev, [provider]: 'error' }));
      const errorMsg = `An unexpected network error occurred while connecting to ${
        provider === 'github' ? 'GitHub' : 'Google'
      }.`;
      setOauthError(errorMsg);
      oauthTimeoutRef.current = window.setTimeout(() => {
        setProviderStates(prev => ({ ...prev, [provider]: 'idle' }));
        setActiveProvider(null);
      }, 3200);
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required.';
      } else if (formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (mode !== 'forgot-password') {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, onSuccessRedirect?: (url: string) => void) => {
    e.preventDefault();
    if (submitStatus === 'loading' || activeProvider !== null) return;
    if (!validate()) return;

    setSubmitStatus('loading');
    dispatch(setLoading(true));
    setErrors({});
    setOauthError(null);

    try {
      const res =
        mode === 'login'
          ? await authApi.login({ email: formData.email, password: formData.password })
          : mode === 'register'
          ? await authApi.register(formData)
          : await authApi.requestPasswordReset(formData.email);

      if (res.success) {
        if (res.user) {
          dispatch(setUser({ user: res.user }));
        } else {
          dispatch(setLoading(false));
        }
        setSubmitStatus('success');
        setStatusMessage(mode === 'login' ? 'Signed in successfully' : 'Account created successfully');

        setTimeout(() => {
          setSubmitStatus('redirecting');
          if (onSuccessRedirect && res.redirectUrl) {
            onSuccessRedirect(res.redirectUrl);
          }
        }, 500);
      } else {
        const errorMsg = res.error?.message || 'Authentication failed.';
        dispatch(setError(res.error || errorMsg));
        setSubmitStatus('error');
        setErrors({ general: errorMsg });
      }
    } catch {
      const errorMsg = 'An unexpected connection error occurred. Please try again.';
      dispatch(setError(errorMsg));
      setSubmitStatus('error');
      setErrors({ general: errorMsg });
    }
  };

  return {
    // Form State & Actions
    formData,
    errors,
    submitStatus,
    statusMessage,
    showPassword,
    passwordStrength,
    setFieldValue,
    setFieldTouched,
    togglePasswordVisibility,
    handleSubmit,

    // Integrated OAuth State & Actions
    providerStates,
    oauthError,
    activeProvider,
    isConnecting: activeProvider !== null,
    connectOAuth,
    clearOAuthError
  };
}

