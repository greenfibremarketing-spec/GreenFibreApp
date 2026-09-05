import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/store";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AuthBootstrap } from "./src/components/auth/AuthBootstrap";
import { SessionSync } from "./src/components/session/SessionSync";
import { useAppSelector, useAppDispatch } from "./src/store/hooks";
import { hideToast } from "./src/store/slices/uiSlice";
import { colors, spacing, typography, shadows } from "./src/theme";
import { SafeAreaView } from "react-native-safe-area-context";

function ToastOverlay() {
  const toast = useAppSelector((s) => s.ui.toast);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => dispatch(hideToast()), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, dispatch]);
  if (!toast) return null;
  return (
    <View style={[styles.toast, toast.type === "error" && styles.toastError]}>
      <Text style={styles.toastText}>{toast.message}</Text>
    </View>
  );
}
function AppContent() {
  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <RootNavigator />
        <ToastOverlay />
      </SafeAreaView>
    </>
  );
}
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AuthBootstrap>
              <SessionSync />
              <AppContent />
            </AuthBootstrap>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 60,
    left: spacing.screen,
    right: spacing.screen,
    backgroundColor: colors.primarySurface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    ...shadows.medium,
    zIndex: 999,
  },
  toastError: {
    backgroundColor: colors.errorLight,
    borderLeftColor: colors.error,
  },
  toastText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
  },
});
