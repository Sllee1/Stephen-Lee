import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/auth";
import { getToken, getUserId } from "../api/client";

interface AuthContextValue {
  ready: boolean;
  isAuthenticated: boolean;
  // Our backend's userId — used as RevenueCat's `appUserID` so its webhook's
  // `app_user_id` matches our DB (see EntitlementContext / services/subscriptions.ts).
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getToken(), getUserId()]).then(([token, storedUserId]) => {
      setIsAuthenticated(Boolean(token));
      setUserIdState(storedUserId);
      setReady(true);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      isAuthenticated,
      userId,
      login: async (email, password) => {
        const result = await authApi.login(email, password);
        setIsAuthenticated(true);
        setUserIdState(result.userId);
      },
      register: async (email, password) => {
        const result = await authApi.register(email, password);
        setIsAuthenticated(true);
        setUserIdState(result.userId);
      },
      logout: async () => {
        await authApi.logout();
        setIsAuthenticated(false);
        setUserIdState(null);
      },
    }),
    [ready, isAuthenticated, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
