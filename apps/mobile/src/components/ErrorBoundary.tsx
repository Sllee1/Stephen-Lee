import React from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * With no error boundary anywhere, an uncaught render-time exception
 * (anywhere in the tree) unmounts the whole app with zero visible feedback
 * in a production build — error overlays only exist in dev builds. The
 * screen just freezes on whatever was last drawn (often a loading spinner)
 * and nothing ever changes again — indistinguishable from a hung network
 * request, except no timeout can ever rescue it since nothing is pending.
 * This at least makes that failure mode visible and recoverable.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] caught a render error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.paper, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: colors.ink, textAlign: "center" }}>Something went wrong</Text>
          <Text style={{ color: colors.muted, textAlign: "center" }}>{this.state.error.message}</Text>
          <Pressable
            onPress={() => this.setState({ error: null })}
            style={{ backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginTop: 8 }}
          >
            <Text style={{ color: colors.paper, fontWeight: "700" }}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
