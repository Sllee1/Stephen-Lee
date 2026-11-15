import React, { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

interface Props extends Omit<TextInputProps, "secureTextEntry" | "style"> {}

/** A password TextInput with a show/hide eye toggle, matching login/register's inputStyle. */
export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ justifyContent: "center" }}>
      <TextInput {...props} secureTextEntry={!visible} style={[inputStyle, { paddingRight: 44 }]} />
      <Pressable onPress={() => setVisible((v) => !v)} style={{ position: "absolute", right: 12, padding: 4 }}>
        <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
      </Pressable>
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
