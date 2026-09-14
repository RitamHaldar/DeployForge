import { useState, useCallback, useRef, useEffect } from 'react';
import type { OAuthProvider, OAuthState } from '../types';
import { authApi } from '../services/authApi';

export function useOAuth() {
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [providerStates, setProviderStates] = useState<Record<OAuthProvider, OAuthState>>({
    github: 'idle',
    google: 'idle'
  });
  const [oauthError, setOauthError] = useState<string | null>(null);

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const connectOAuth = useCallback(async (provider: OAuthProvider) => {
    if (activeProvider !== null) return; // Prevent concurrent handshakes

    setOauthError(null);
    setActiveProvider(provider);
    setProviderStates(prev => ({ ...prev, [provider]: 'connecting' }));

    try {
      const result = await authApi.initiateOAuth(provider);

      if (result.redirectUrl) {
        setProviderStates(prev => ({ ...prev, [provider]: 'redirecting' }));
        // Brief transition delay so the user perceives the redirect feedback cleanly
        timeoutRef.current = window.setTimeout(() => {
          window.location.href = result.redirectUrl!;
        }, 400);
      } else if (result.error) {
        setProviderStates(prev => ({ ...prev, [provider]: 'error' }));
        setOauthError(result.error);
        timeoutRef.current = window.setTimeout(() => {
          setProviderStates(prev => ({ ...prev, [provider]: 'idle' }));
          setActiveProvider(null);
        }, 3200);
      }
    } catch {
      setProviderStates(prev => ({ ...prev, [provider]: 'error' }));
      setOauthError(`An unexpected network error occurred while connecting to ${provider === 'github' ? 'GitHub' : 'Google'}.`);
      timeoutRef.current = window.setTimeout(() => {
        setProviderStates(prev => ({ ...prev, [provider]: 'idle' }));
        setActiveProvider(null);
      }, 3200);
    }
  }, [activeProvider]);

  const clearOAuthError = useCallback(() => {
    setOauthError(null);
  }, []);

  return {
    activeProvider,
    providerStates,
    oauthError,
    connectOAuth,
    clearOAuthError,
    isConnecting: activeProvider !== null
  };
}
