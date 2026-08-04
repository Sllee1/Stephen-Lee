import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import type { AnalyzeTechniqueVideoResponse } from "@nutrition-app/shared";
import { analyzeTechniqueVideo } from "../api/ai";
import { extractVideoFrames, type ExtractedFrame } from "../services/videoFrames";
import { colors } from "../theme";

/**
 * Record or pick a short clip, extract a handful of evenly-spaced frames
 * (see services/videoFrames.ts — no <video>/<canvas> in RN, so this is a
 * native-thumbnail based replacement for the prototype's approach), and
 * send them to the backend as a chronological sequence for form feedback.
 */
export function TechniqueCheckSection() {
  const [movementLabel, setMovementLabel] = useState("");
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [previewFrames, setPreviewFrames] = useState<ExtractedFrame[]>([]);
  const [cappedAt, setCappedAt] = useState<number | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeTechniqueVideoResponse | null>(null);

  async function pickVideo(fromCamera: boolean) {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Enable camera/photo access in Settings to check your technique.");
      return;
    }

    const pickerResult = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, videoMaxDuration: 60 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos });

    if (pickerResult.canceled) return;
    const asset = pickerResult.assets[0];

    setResult(null);
    setVideoUri(asset.uri);
    setPreviewFrames([]);
    setExtracting(true);
    try {
      // asset.duration is frequently null/undefined depending on picker and
      // platform (not just for malformed videos) — extractVideoFrames
      // handles that itself rather than us gating on it here.
      const { frames, cappedAt: capped } = await extractVideoFrames(asset.uri, asset.duration ?? null);
      setPreviewFrames(frames);
      setCappedAt(capped);
    } catch (err) {
      Alert.alert("Couldn't process that video", err instanceof Error ? err.message : "Try a different clip.");
      setVideoUri(null);
    } finally {
      setExtracting(false);
    }
  }

  async function runAnalysis() {
    if (previewFrames.length === 0) return;
    setAnalyzing(true);
    try {
      const response = await analyzeTechniqueVideo({
        movementLabel: movementLabel.trim() || null,
        frames: previewFrames.map((f) => ({ time: f.time, imageBase64: f.imageBase64 })),
      });
      setResult(response);
    } catch {
      Alert.alert("Analysis failed", "Couldn't analyze that clip — try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <TextInput
        value={movementLabel}
        onChangeText={setMovementLabel}
        placeholder="What movement is this? (optional, e.g. back squat)"
        style={inputStyle}
      />

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable onPress={() => pickVideo(true)} style={{ flex: 1, backgroundColor: colors.ink, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.paper, fontWeight: "700" }}>Record clip</Text>
        </Pressable>
        <Pressable onPress={() => pickVideo(false)} style={{ flex: 1, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, alignItems: "center" }}>
          <Text style={{ color: colors.ink, fontWeight: "700" }}>Choose from library</Text>
        </Pressable>
      </View>

      {extracting ? (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <ActivityIndicator color={colors.rust} />
          <Text style={{ color: colors.muted }}>Pulling frames from the clip…</Text>
        </View>
      ) : null}

      {cappedAt ? <Text style={{ color: colors.amber, fontSize: 12 }}>Clip capped to the first {cappedAt}s.</Text> : null}

      {previewFrames.length > 0 ? (
        <View style={{ gap: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {previewFrames.map((f, i) => (
                <Image key={i} source={{ uri: f.thumbUri }} style={{ width: 64, height: 64, borderRadius: 8 }} />
              ))}
            </View>
          </ScrollView>

          <Pressable onPress={runAnalysis} disabled={analyzing} style={{ backgroundColor: colors.green, borderRadius: 10, padding: 12, alignItems: "center" }}>
            {analyzing ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Check my form</Text>}
          </Pressable>
        </View>
      ) : null}

      {result ? (
        <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 14, gap: 10 }}>
          <Text style={{ fontWeight: "800", color: colors.ink }}>{result.movement}</Text>
          <Text style={{ color: colors.ink }}>{result.summary}</Text>

          {result.strengths.length > 0 ? (
            <View style={{ gap: 4 }}>
              {result.strengths.map((s, i) => (
                <Text key={i} style={{ color: colors.green }}>✓ {s}</Text>
              ))}
            </View>
          ) : null}

          {result.improvements.length > 0 ? (
            <View style={{ gap: 4 }}>
              {result.improvements.map((s, i) => (
                <Text key={i} style={{ color: colors.amber }}>• {s}</Text>
              ))}
            </View>
          ) : null}

          {result.safetyNotes.length > 0 ? (
            <View style={{ borderWidth: 1, borderColor: colors.rust, borderRadius: 8, padding: 10, gap: 4 }}>
              <Text style={{ color: colors.rust, fontWeight: "700" }}>Safety notes</Text>
              {result.safetyNotes.map((s, i) => (
                <Text key={i} style={{ color: colors.rust }}>{s}</Text>
              ))}
            </View>
          ) : null}

          <Text style={{ color: colors.muted, fontSize: 12 }}>Confidence: {result.confidence}</Text>
        </View>
      ) : null}

      {!videoUri ? <Text style={{ color: colors.muted, fontSize: 12 }}>Not medical or injury-diagnosis advice — general form feedback only.</Text> : null}
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 8,
  padding: 10,
  color: colors.ink,
  backgroundColor: colors.card,
};
