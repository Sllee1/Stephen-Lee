import React, { createContext, useContext, useEffect, useState } from "react";
import { getEntitlement, type EntitlementResponse } from "../api/entitlement";
import { useAuth } from "./AuthContext";

const defaultValue: EntitlementResponse = { tier: "free", adsEnabled: true, expiresAt: null };

const EntitlementContext = createContext<EntitlementResponse>(defaultValue);

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [entitlement, setEntitlement] = useState<EntitlementResponse>(defaultValue);

  useEffect(() => {
    if (!isAuthenticated) {
      setEntitlement(defaultValue);
      return;
    }
    getEntitlement()
      .then(setEntitlement)
      .catch(() => setEntitlement(defaultValue));
  }, [isAuthenticated]);

  return <EntitlementContext.Provider value={entitlement}>{children}</EntitlementContext.Provider>;
}

export function useEntitlement(): EntitlementResponse {
  return useContext(EntitlementContext);
}
