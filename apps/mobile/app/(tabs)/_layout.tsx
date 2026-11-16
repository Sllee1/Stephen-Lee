import React from "react";
import { Image, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  today: "home",
  log: "camera",
  trainer: "barbell",
  plan: "calendar",
  profile: "person",
};

function HeaderTitle() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Image source={require("../../assets/icon.png")} style={{ width: 28, height: 28, borderRadius: 6 }} />
      <Text style={{ color: colors.paper, fontWeight: "800", fontSize: 16 }}>OTAS Health & Fitness Planner</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: () => <HeaderTitle />,
        headerTitleAlign: "center",
        headerStyle: { backgroundColor: colors.ink },
        headerTitleStyle: { color: colors.paper, fontWeight: "800", fontSize: 16 },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name] ?? "ellipse"} color={color} size={size} />,
      })}
    >
      <Tabs.Screen name="today" options={{ title: "Today" }} />
      <Tabs.Screen name="log" options={{ title: "Log" }} />
      <Tabs.Screen name="trainer" options={{ title: "Trainer" }} />
      <Tabs.Screen name="plan" options={{ title: "Plan" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
