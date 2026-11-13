import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { adjustedBmi, bmiCategory, BUILD_LABELS, cmToFtIn, computeBMI, kgToLb, MOTIVATION_MODES, type BmiPreference, type UnitPref } from "@nutrition-app/shared";
import { useProfile } from "../../src/hooks/useProfile";
import { saveProfile } from "../../src/api/profile";
import { analyzeBuildPhoto } from "../../src/api/ai";
import { useAuth } from "../../src/context/AuthContext";
import { useEntitlement } from "../../src/context/EntitlementContext";
import { registerForPushNotifications } from "../../src/services/notifications";
import { PAYWALL_RESULT, presentCustomerCenter, presentPaywall } from "../../src/services/subscriptions";
import { Card } from "../../src/components/Card";
import { HeightWeightFields } from "../../src/components/HeightWeightFields";
import { colors, colorForBmiCategory } from "../../src/theme";

function formatHeightWeight(heightCm: number, weightKg: number, unitPref: UnitPref): string {
  if (unitPref === "imperial") {
    const { ft, inch } = cmToFtIn(heightCm);
    return `${ft}'${inch}" · ${Math.round(kgToLb(weightKg))} lb`;
  }
  return `${Math.round(heightCm)} cm · ${Math.round(weightKg)} kg`;
}

export default function ProfileScreen() {
  const { profile, loading, refetch } = useProfile();
  const { logout, deleteAccount } = useAuth();
  const entitlement = useEntitlement();
  const [buildThumb, setBuildThumb] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<{ build: string; bmiOffset: number; note: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingHW, setEditingHW] = useState(false);
  const [savingHW, setSavingHW] = useState(false);
  const [pendingUnitPref, setPendingUnitPref] = useState<UnitPref>("metric");
  const [pendingHeightCm, setPendingHeightCm] = useState<number | null>(null);
  const [pendingWeightKg, setPendingWeightKg] = useState<number | null>(null);

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.primary} />
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

  function startEditingHW() {
    setPendingUnitPref(profile!.unitPref);
    setPendingHeightCm(profile!.heightCm);
    setPendingWeightKg(profile!.weightKg);
    setEditingHW(true);
  }

  async function saveHW() {
    if (!pendingHeightCm || !pendingWeightKg) return;
    setSavingHW(true);
    try {
      await saveProfile({ unitPref: pendingUnitPref, heightCm: pendingHeightCm, weightKg: pendingWeightKg });
      await refetch();
      setEditingHW(false);
    } catch {
      Alert.alert("Something went wrong", "Couldn't save — try again.");
    } finally {
      setSavingHW(false);
    }
  }

  async function upgradeToPremium() {
    setPurchasing(true);
    try {
      const result = await presentPaywall();
      if (result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED) {
        // The RevenueCat webhook (apps/backend/src/routes/subscriptions.ts)
        // is what actually flips the DB row this reads from — it's usually
        // near-instant, but immediately after a purchase there's a small
        // window where it hasn't landed yet.
        await entitlement.refresh();
      }
    } catch {
      Alert.alert("Something went wrong", "Couldn't open the upgrade screen — try again.");
    } finally {
      setPurchasing(false);
    }
  }

  async function manageSubscription() {
    try {
      await presentCustomerCenter();
      await entitlement.refresh();
    } catch {
      Alert.alert("Something went wrong", "Couldn't open subscription management — try again.");
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      "Delete your account?",
      "This permanently deletes your profile, meal/workout history, and calendar — it can't be undone. This does not cancel an active subscription; manage that from Manage Subscription above first.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
            } catch {
              Alert.alert("Something went wrong", "Couldn't delete your account — try again.");
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>Profile</Text>

      <Card title="Height & weight" icon="body-outline">
        {editingHW ? (
          <View style={{ gap: 12 }}>
            <HeightWeightFields
              initialUnitPref={pendingUnitPref}
              initialHeightCm={pendingHeightCm}
              initialWeightKg={pendingWeightKg}
              onChange={(v) => {
                setPendingUnitPref(v.unitPref);
                setPendingHeightCm(v.heightCm);
                setPendingWeightKg(v.weightKg);
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={saveHW} disabled={savingHW} style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 10, padding: 12, alignItems: "center" }}>
                {savingHW ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Save</Text>}
              </Pressable>
              <Pressable
                onPress={() => setEditingHW(false)}
                disabled={savingHW}
                style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}
              >
                <Text style={{ color: colors.ink, fontWeight: "600" }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={startEditingHW}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.ink }}>
              {formatHeightWeight(profile.heightCm, profile.weightKg, profile.unitPref)}
            </Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>Tap to edit</Text>
          </Pressable>
        )}
      </Card>

      <Card title="BMI" icon="analytics-outline">
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
          {analyzing ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.ink, fontWeight: "600" }}>Add a build photo for a more personal estimate</Text>}
        </Pressable>
      </Card>

      <Card title="Motivation mode" icon="flame-outline">
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
      </Card>

      <Card title="Notifications" icon="notifications-outline">
        <Pressable onPress={() => registerForPushNotifications()} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Enable workout & eating-window reminders</Text>
        </Pressable>
      </Card>

      <Card title="Premium" icon="star-outline">
        {entitlement.tier === "premium" ? (
          <>
            <Text style={{ color: colors.ink, fontWeight: "600" }}>Premium active — ads off</Text>
            {entitlement.expiresAt ? (
              <Text style={{ color: colors.muted }}>Renews/expires {new Date(entitlement.expiresAt).toLocaleDateString()}</Text>
            ) : null}
            <Pressable onPress={manageSubscription} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 4 }}>
              <Text style={{ color: colors.ink, fontWeight: "600" }}>Manage subscription</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={{ color: colors.muted }}>Remove ads and unlock premium-only features.</Text>
            <Pressable onPress={upgradeToPremium} disabled={purchasing} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 12, alignItems: "center", marginTop: 4 }}>
              {purchasing ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Upgrade to Premium</Text>}
            </Pressable>
          </>
        )}
      </Card>

      <Pressable onPress={logout} style={{ borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: colors.rust }}>
        <Text style={{ color: colors.rust, fontWeight: "700" }}>Log out</Text>
      </Pressable>

      <Pressable onPress={confirmDeleteAccount} disabled={deleting} style={{ padding: 10, alignItems: "center" }}>
        {deleting ? <ActivityIndicator color={colors.muted} /> : <Text style={{ color: colors.muted, fontWeight: "600", textDecorationLine: "underline" }}>Delete account</Text>}
      </Pressable>
    </ScrollView>
  );
}
