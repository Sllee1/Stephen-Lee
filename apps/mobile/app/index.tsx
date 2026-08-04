import React from "react";
import { ActivityIndicator, View } from "react-native";
import { colors } from "../src/theme";

/** Never actually seen — RootNavigationGuard redirects away from "/" on mount. */
export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
      <ActivityIndicator color={colors.rust} />
    </View>
  );
}
