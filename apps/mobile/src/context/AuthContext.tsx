import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { getToken } from "../api/client";

interface AuthContextValue {
  ready: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getToken().then((token) => {
      setIsAuthenticated(Boolean(token));
      setReady(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuthenticated,
      login: async (email, password) => {
        await authApi.login(email, password);
        setIsAuthenticated(true);
      },
      register: async (email, password) => {
        await authApi.register(email, password);
        setIsAuthenticated(true);
      },
      logout: async () => {
        await authApi.logout();
        setIsAuthenticated(false);
      },
    }),
    [ready, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
