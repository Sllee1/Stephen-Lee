import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { emptyNutrientTotals, todayKey, type MealItem } from "@nutrition-app/shared";
import { analyzeFoodPhoto } from "../../src/api/ai";
import { createMeal } from "../../src/api/meals";
import { FoodPicker } from "../../src/components/FoodPicker";
import { NutritionFacts } from "../../src/components/NutritionFacts";
import { colors } from "../../src/theme";

/**
 * Photo -> analyze -> review -> save. The prototype resized client-side to
 * two sizes (thumb + upload) before ever touching the network; ImagePicker's
 * `quality` option handles the "don't upload a 12MP photo" half of that —
 * a full thumbnail-generation step (e.g. expo-image-manipulator) is the
 * next thing to add here if raw picker output turns out too large for the
 * meal-list thumbnail.
 */
export default function LogScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [items, setItems] = useState<MealItem[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confidence, setConfidence] = useState<"low" | "medium" | "high" | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  async function pickAndAnalyze(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Enable camera/photo access in Settings to log a meal by photo.");
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, allowsEditing: false });

    if (result.canceled || !result.assets[0].base64) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
    setAnalyzing(true);
    try {
      const analysis = await analyzeFoodPhoto(asset.base64!);
      setConfidence(analysis.confidence);
      const newItems: MealItem[] = analysis.items.map((item, i) => ({
        id: `photo-${Date.now()}-${i}`,
        ...emptyNutrientTotals(),
        ...item,
      }));
      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      Alert.alert("Analysis failed", "Couldn't analyze that photo — try again or add items manually.");
    } finally {
      setAnalyzing(false);
    }
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function confirmSave() {
    if (items.length === 0) return;
    setSaving(true);
    try {
      await createMeal({
        date: todayKey(),
        name: items.map((i) => i.name).join(", "),
        thumbUrl: imageUri,
        time: new Date().toISOString(),
        items,
      });
      setItems([]);
      setImageUri(null);
      setImageBase64(null);
      setConfidence(null);
      router.push("/(tabs)/today");
    } catch (err) {
      Alert.alert("Couldn't save", "Something went wrong saving this meal — try again.");
    } finally {
      setSaving(false);
    }
  }

  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.paper }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: colors.ink }}>Log a meal</Text>

      {imageUri ? <Image source={{ uri: imageUri }} style={{ width: "100%", height: 200, borderRadius: 12 }} /> : null}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={() => pickAndAnalyze(true)} style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center" }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Take photo</Text>
        </Pressable>
        <Pressable onPress={() => pickAndAnalyze(false)} style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "700" }}>Choose from library</Text>
        </Pressable>
      </View>

      {analyzing ? (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <ActivityIndicator color={colors.rust} />
          <Text style={{ color: colors.muted }}>Analyzing photo…</Text>
        </View>
      ) : null}

      {confidence === "low" ? (
        <Text style={{ color: colors.amber }}>Low confidence — double check the detected items below.</Text>
      ) : null}

      {items.length > 0 ? (
        <View style={{ gap: 10 }}>
          <Text style={{ fontWeight: "700", color: colors.ink }}>Detected items ({Math.round(totalCalories)} cal total)</Text>
          {items.map((item) => (
            <DetectedItemCard key={item.id} item={item} onRemove={() => removeItem(item.id)} />
          ))}

          <Pressable onPress={confirmSave} disabled={saving} style={{ backgroundColor: colors.green, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 }}>
            {saving ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Save meal</Text>}
          </Pressable>
        </View>
      ) : null}

      <Pressable onPress={() => setShowPicker(true)} style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 14, alignItems: "center" }}>
        <Text style={{ color: colors.ink, fontWeight: "700" }}>+ Add a food without a photo</Text>
      </Pressable>

      <Modal visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <FoodPicker
          onAdd={(item) => {
            setItems((prev) => [...prev, item]);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      </Modal>
    </ScrollView>
  );
}

function DetectedItemCard({ item, onRemove }: { item: MealItem; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, gap: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", color: colors.ink }}>{item.name}</Text>
          <Text style={{ color: colors.muted }}>
            {Math.round(item.calories)} cal · P{Math.round(item.protein_g)} C{Math.round(item.carbs_g)} F{Math.round(item.fat_g)}
          </Text>
        </View>
        <Pressable onPress={onRemove}>
          <Text style={{ color: colors.rust }}>Remove</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => setExpanded((v) => !v)}>
        <Text style={{ color: colors.rust, fontWeight: "600", fontSize: 13 }}>{expanded ? "Hide" : "Show"} nutrition facts</Text>
      </Pressable>
      {expanded ? <NutritionFacts totals={item} /> : null}
    </View>
  );
}
