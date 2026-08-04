import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme";

/**
 * Redirects between the (auth) group and (tabs) group based on auth state —
 * mirrors the prototype's `!profile || editing` full-screen swap, but for
 * "logged in vs not" rather than "onboarded vs not" (onboarding itself is a
 * route inside the authenticated group; see app/onboarding.tsx).
 */
export function RootNavigationGuard({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)/today");
    }
  }, [ready, isAuthenticated, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.rust} />
      </View>
    );
  }

  return <>{children}</>;
}
