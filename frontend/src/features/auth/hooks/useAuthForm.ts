import { useState, useCallback, useMemo } from 'react';
import type {
  AuthMode,
  AuthFormData,
  ValidationErrors,
  PasswordStrengthInfo,
  SubmitStatus
} from '../types';
import { authApi } from '../services/authApi';

export function useAuthForm(initialMode: AuthMode = 'login') {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Email format validator
  const isEmailValid = useMemo(() => {
    if (!formData.email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  }, [formData.email]);

  // Password strength evaluator
  const passwordStrength = useMemo<PasswordStrengthInfo>(() => {
    const val = formData.password;
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
    if (score === 1 || score === 2) {
      return { score: 2, level: 'fair', label: 'Fair', activeBars: 2 };
    }
    if (score === 3) {
      return { score: 3, level: 'strong', label: 'Strong', activeBars: 3 };
    }
    return { score: 4, level: 'excellent', label: 'Excellent', activeBars: 4 };
  }, [formData.password]);

  // Field change handler
  const setFieldValue = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when the user edits
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  }, []);

  const setFieldTouched = useCallback((field: keyof AuthFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Mode switcher with error reset
  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setTouched({});
    setSubmitStatus('idle');
    setStatusMessage('');
  }, []);

  // Form validator
  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (mode === 'register') {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required.';
      } else if (formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters.';
      } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username.trim())) {
        newErrors.username = 'Only letters, numbers, underscores, and dashes allowed.';
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
  }, [formData, mode]);

  // Form submission handler
  const handleSubmit = useCallback(async (e: React.FormEvent, onSuccessRedirect?: (url: string) => void) => {
    e.preventDefault();
    if (submitStatus === 'loading') return;

    // Touch all applicable fields
    setTouched({ username: true, email: true, password: true });

    if (!validate()) return;

    setSubmitStatus('loading');
    setErrors({});

    try {
      if (mode === 'login') {
        const res = await authApi.login({
          email: formData.email,
          password: formData.password
        });

        if (res.success) {
          setSubmitStatus('success');
          setStatusMessage('Signed in successfully');
          setTimeout(() => {
            setSubmitStatus('redirecting');
            setStatusMessage('Redirecting to DeployForge console...');
            setTimeout(() => {
              if (onSuccessRedirect && res.redirectUrl) {
                onSuccessRedirect(res.redirectUrl);
              }
            }, 600);
          }, 450);
        } else {
          setSubmitStatus('error');
          setErrors({ general: res.error?.message || 'Authentication failed.' });
        }
      } else if (mode === 'register') {
        const res = await authApi.register(formData);

        if (res.success) {
          setSubmitStatus('success');
          setStatusMessage('Account created successfully');
          setTimeout(() => {
            setSubmitStatus('redirecting');
            setStatusMessage('Setting up your developer workspace...');
            setTimeout(() => {
              if (onSuccessRedirect && res.redirectUrl) {
                onSuccessRedirect(res.redirectUrl);
              }
            }, 600);
          }, 450);
        } else {
          setSubmitStatus('error');
          if (res.error?.code === 'username_taken') {
            setErrors({ username: res.error.message });
          } else if (res.error?.code === 'email_already_registered') {
            setErrors({ email: res.error.message });
          } else {
            setErrors({ general: res.error?.message || 'Registration failed.' });
          }
        }
      } else if (mode === 'forgot-password') {
        const res = await authApi.requestPasswordReset(formData.email);

        if (res.success) {
          setSubmitStatus('success');
          setStatusMessage(`Password recovery dispatched to ${formData.email}`);
          setTimeout(() => {
            switchMode('login');
          }, 2400);
        } else {
          setSubmitStatus('error');
          setErrors({ general: res.error?.message || 'Failed to dispatch reset email.' });
        }
      }
    } catch {
      setSubmitStatus('error');
      setErrors({ general: 'An unexpected connection error occurred. Please try again.' });
    }
  }, [formData, mode, submitStatus, validate, switchMode]);

  return {
    mode,
    formData,
    touched,
    errors,
    submitStatus,
    statusMessage,
    showPassword,
    isEmailValid,
    passwordStrength,
    setFieldValue,
    setFieldTouched,
    togglePasswordVisibility,
    switchMode,
    handleSubmit
  };
}
