import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme";
import { AppHeader } from "./AppHeader";
export function ScreenContainer({
  children,
  scroll = true,
  showHeader = true,
  showOfferBar = true,
  headerTitle,
  onMenuPress,
  style,
  contentStyle,
  ...scrollProps
}) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={[styles.container, style]} edges={["bottom"]}>
      {showHeader && (
        <AppHeader
          showOfferBar={showOfferBar}
          title={headerTitle}
          onMenuPress={onMenuPress}
        />
      )}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  content: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
