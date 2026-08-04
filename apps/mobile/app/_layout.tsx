import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";
import { EntitlementProvider } from "../src/context/EntitlementContext";
import { RootNavigationGuard } from "../src/navigation/RootNavigationGuard";

export default function RootLayout() {
  return (
    <AuthProvider>
      <EntitlementProvider>
        <RootNavigationGuard>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </RootNavigationGuard>
      </EntitlementProvider>
    </AuthProvider>
  );
}
