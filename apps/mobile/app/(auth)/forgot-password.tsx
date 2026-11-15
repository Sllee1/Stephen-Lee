import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { ApiError } from "../../src/api/client";
import { PasswordField } from "../../src/components/PasswordField";
import { colors } from "../../src/theme";

/**
 * Two steps on one screen: request a 6-digit code by email, then enter it
 * with a new password. No deep link needed — simpler to get right on both
 * platforms than an emailed link into the app.
 */
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestPasswordReset, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleRequestCode() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email first.");
      return;
    }
    setRequesting(true);
    try {
      await requestPasswordReset(email.trim());
      setCodeRequested(true);
      setInfo("If that email has an account, a 6-digit code is on its way — check your inbox.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong — try again.");
    } finally {
      setRequesting(false);
    }
  }

  async function handleReset() {
    setError(null);
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setResetting(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      router.replace("/(tabs)/today");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That code didn't work — check it and try again.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: colors.ink, marginBottom: 8 }}>Reset your password</Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>Email</Text>
        <TextInput
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!codeRequested}
          value={email}
          onChangeText={setEmail}
          style={[inputStyle, codeRequested ? { opacity: 0.6 } : null]}
        />
      </View>

      {!codeRequested ? (
        <Pressable
          onPress={handleRequestCode}
          disabled={requesting}
          style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 }}
        >
          {requesting ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Send reset code</Text>}
        </Pressable>
      ) : (
        <>
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>6-digit code</Text>
            <TextInput
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "700", color: colors.ink }}>New password</Text>
            <PasswordField placeholder="Min 8 characters" value={newPassword} onChangeText={setNewPassword} />
          </View>

          <Pressable
            onPress={handleReset}
            disabled={resetting}
            style={{ backgroundColor: colors.ink, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 }}
          >
            {resetting ? <ActivityIndicator color={colors.paper} /> : <Text style={{ color: colors.paper, fontWeight: "700" }}>Reset password</Text>}
          </Pressable>

          <Pressable onPress={handleRequestCode} disabled={requesting}>
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 4 }}>Didn't get it? Resend code</Text>
          </Pressable>
        </>
      )}

      {info ? <Text style={{ color: colors.green }}>{info}</Text> : null}
      {error ? <Text style={{ color: colors.rust }}>{error}</Text> : null}

      <Link href="/(auth)/login" style={{ textAlign: "center", marginTop: 12, color: colors.muted }}>
        Back to log in
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
