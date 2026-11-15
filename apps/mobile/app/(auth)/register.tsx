import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { ApiError } from "../../src/api/client";
import { PasswordField } from "../../src/components/PasswordField";
import { colors } from "../../src/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);
    try {
      await register(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink, marginBottom: 8 }}>Create your account</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>Password</Text>
        <PasswordField placeholder="Min 8 characters" value={password} onChangeText={setPassword} />
      </View>

      {error ? <Text style={{ color: colors.rust }}>{error}</Text> : null}

      <Pressable onPress={handleSubmit} disabled={loading} style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 }}>
        {loading ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Create account</Text>}
      </Pressable>

      <Link href="/(auth)/login" style={{ textAlign: "center", marginTop: 12, color: colors.muted }}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.line,
  borderRadius: 10,
  padding: 14,
  backgroundColor: colors.card,
};
