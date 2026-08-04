import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { adjustedBmi, bmiCategory, BUILD_LABELS, computeBMI, MOTIVATION_MODES, type BmiPreference } from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { saveProfile } from "../../src/api/profile";
import { analyzeBuildPhoto } from "../../src/api/ai";
import { useAuth } from "../../src/context/AuthContext";
import { registerForPushNotifications } from "../../src/services/notifications";
import { colors, colorForBmiCategory } from "../../src/theme";

export default function ProfileScreen() {
  const { profile, loading, refetch } = useProfile();
  const { logout } = useAuth();
  const [buildThumb, setBuildThumb] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<{ build: string; bmiOffset: number; note: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.rust} />
      </View>
    );
  }

  const rawBmi = computeBMI(profile.heightCm, profile.weightKg);
  const adjusted = buildResult ? adjustedBmi(rawBmi, buildResult.build, buildResult.bmiOffset) : null;
  const primaryBmi = profile.bmiPreference === "adjusted" && adjusted != null ? adjusted : rawBmi;
  const category = bmiCategory(primaryBmi);

  async function captureBuildPhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Enable camera access in Settings to use this feature.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (result.canceled || !result.assets[0].base64) return;

    const asset = result.assets[0];
    setBuildThumb(asset.uri);
    setAnalyzing(true);
    try {
      const analysis = await analyzeBuildPhoto(asset.base64!, asset.uri);
      setBuildResult(analysis);
    } catch {
      Alert.alert("Analysis failed", "Couldn't analyze that photo — try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function setBmiPreference(pref: BmiPreference) {
    saveProfile({ bmiPreference: pref }).then(refetch);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>Profile</Text>

      <Section title="BMI">
        <Text style={{ fontSize: 32, fontWeight: "800", color: colorForBmiCategory[category.colorToken] }}>{primaryBmi.toFixed(1)}</Text>
        <Text style={{ color: colors.ink }}>{category.label}</Text>

        {adjusted != null ? (
          <Pressable onPress={() => setBmiPreference(profile.bmiPreference === "adjusted" ? "standard" : "adjusted")} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.muted }}>
              {profile.bmiPreference === "adjusted" ? `Standard BMI: ${rawBmi.toFixed(1)} — use this instead` : `Photo-adjusted: ${adjusted.toFixed(1)} — use this instead`}
            </Text>
          </Pressable>
        ) : null}

        {buildThumb ? <Image source={{ uri: buildThumb }} style={{ width: 80, height: 80, borderRadius: 8, marginTop: 8 }} /> : null}
        {buildResult ? (
          <Text style={{ color: colors.muted, marginTop: 4 }}>{BUILD_LABELS[buildResult.build]} — {buildResult.note}</Text>
        ) : null}

        <Pressable onPress={captureBuildPhoto} disabled={analyzing} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 10 }}>
          {analyzing ? <ActivityIndicator color={colors.rust} /> : <Text style={{ color: colors.ink, fontWeight: "600" }}>Add a build photo for a more personal estimate</Text>}
        </Pressable>
      </Section>

      <Section title="Motivation mode">
        <View style={{ gap: 8 }}>
          {MOTIVATION_MODES.map((m) => (
            <Pressable
              key={m.id}
              onPress={() => saveProfile({ motivationMode: m.id }).then(refetch)}
              style={{
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: 10,
                padding: 12,
                backgroundColor: profile.motivationMode === m.id ? colors.ink : colors.card,
              }}
            >
              <Text style={{ fontWeight: "700", color: profile.motivationMode === m.id ? colors.paper : colors.ink }}>{m.label}</Text>
              <Text style={{ color: profile.motivationMode === m.id ? colors.paper : colors.muted }}>{m.sub}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Notifications">
        <Pressable onPress={() => registerForPushNotifications()} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Enable workout & eating-window reminders</Text>
        </Pressable>
      </Section>

      <Pressable onPress={logout} style={{ borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.rust }}>
        <Text style={{ color: colors.rust, fontWeight: "700" }}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 16, gap: 10 }}>
      <Text style={{ fontWeight: "800", fontSize: 16, color: colors.ink }}>{title}</Text>
      {children}
    </View>
  );
}
