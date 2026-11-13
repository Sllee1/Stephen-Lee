import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cardShadow, colors } from "../theme";

interface Props {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
}

/** Shared elevated card used for every titled section box across the app. */
export function Card({ title, icon, children }: Props) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, gap: 10, ...cardShadow }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon ? <Ionicons name={icon} size={18} color={colors.primary} /> : null}
        <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
