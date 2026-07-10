import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { AuthUser, fetchMe, loginRequest, registerRequest } from '@/services/authService';
import { clearToken, getToken, setToken as persistToken } from '@/services/tokenStorage';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      if (stored) {
        try {
          const { user: me } = await fetchMe(stored);
          setTokenState(stored);
          setUser(me);
        } catch {
          // Token expiré ou invalide : on nettoie et on repart déconnecté.
          await clearToken();
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await loginRequest(email, password);
    await persistToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { token: newToken, user: newUser } = await registerRequest(email, password, name);
    await persistToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
