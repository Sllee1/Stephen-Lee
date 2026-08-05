import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getEntitlement, type EntitlementResponse } from "../api/entitlement";
import { configurePurchases } from "../services/subscriptions";
import { useAuth } from "./AuthContext";

const defaultValue: EntitlementResponse = { tier: "free", adsEnabled: true, expiresAt: null };

interface EntitlementContextValue extends EntitlementResponse {
  /** Re-fetches /entitlement — call after a purchase/restore so the paywall's result is reflected without waiting for the next app launch. */
  refresh: () => Promise<void>;
}

const EntitlementContext = createContext<EntitlementContextValue>({ ...defaultValue, refresh: async () => {} });

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userId } = useAuth();
  const [entitlement, setEntitlement] = useState<EntitlementResponse>(defaultValue);
  const configuredForUserId = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setEntitlement(defaultValue);
      return;
    }
    try {
      setEntitlement(await getEntitlement());
    } catch {
      setEntitlement(defaultValue);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated || !userId || configuredForUserId.current === userId) return;
    // The backend's /entitlement response (above) stays the source of truth
    // for ads/premium gating — this just readies the RevenueCat SDK so
    // presentPaywall()/presentCustomerCenter() (services/subscriptions.ts)
    // have something to present.
    configuredForUserId.current = userId;
    configurePurchases(userId);
  }, [isAuthenticated, userId]);

  return <EntitlementContext.Provider value={{ ...entitlement, refresh }}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): EntitlementContextValue {
  return useContext(EntitlementContext);
}
