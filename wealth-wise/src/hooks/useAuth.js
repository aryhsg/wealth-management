// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
  const auth = getAuth();

  useEffect(() => {
    const initAuth = async () => {
      // 處理初始 Token (如果是從後端重新導向)
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      }
      setIsLoading(false);
    };

    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, [auth]);

  return { user, isLoading, authMode, setAuthMode, auth };
};