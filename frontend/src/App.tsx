import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomePage } from './features/home';
import { AuthPage } from './features/auth';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search;
  });

  const navigate = useCallback((path: string) => {
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine active view based on path
  const isAuthRoute =
    currentPath.startsWith('/auth') ||
    currentPath.startsWith('/login') ||
    currentPath.startsWith('/register') ||
    currentPath.startsWith('/forgot-password');

  // Parse mode parameter
  let authMode: 'login' | 'register' | 'forgot-password' = 'login';
  if (currentPath.includes('mode=register') || currentPath.startsWith('/register')) {
    authMode = 'register';
  } else if (currentPath.includes('mode=forgot-password') || currentPath.startsWith('/forgot-password')) {
    authMode = 'forgot-password';
  }

  return (
    <AnimatePresence mode="wait">
      {isAuthRoute ? (
        <motion.div
          key="auth-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <AuthPage
            initialMode={authMode}
            onNavigateHome={() => navigate('/')}
            onNavigate={navigate}
          />
        </motion.div>
      ) : (
        <motion.div
          key="home-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <HomePage onNavigate={navigate} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
