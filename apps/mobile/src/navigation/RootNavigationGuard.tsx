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
    // Anything that isn't already inside the authenticated app itself —
    // this is "(tabs)" or "onboarding" ("onboarding" is otherwise
    // redirected to from inside "(tabs)/today", not handled here).
    // Critically, this also covers segments[0] being undefined/"index":
    // that's the bare "/" entry route every cold start lands on first —
    // an authenticated returning user landed there too, but neither
    // branch below used to cover it (inAuthGroup is false there, same as
    // "(tabs)"), so the redirect never fired and "/" (just a spinner,
    // see app/index.tsx) was the whole screen, forever, every time an
    // already-logged-in user reopened the app.
    const inAuthenticatedApp = segments[0] === "(tabs)" || segments[0] === "onboarding";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && !inAuthenticatedApp) {
      router.replace("/(tabs)/today");
    }
  }, [ready, isAuthenticated, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}
