import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { EntitlementProvider } from "../src/context/EntitlementContext";
import { RootNavigationGuard } from "../src/navigation/RootNavigationGuard";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { initializeAds } from "../src/services/adsConsent";

export default function RootLayout() {
  useEffect(() => {
    initializeAds();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <EntitlementProvider>
          <RootNavigationGuard>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </RootNavigationGuard>
        </EntitlementProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
