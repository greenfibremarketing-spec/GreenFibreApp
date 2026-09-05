// src/screens/SplashScreen.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../store/hooks";

export function SplashScreen() {
  const navigation = useNavigation();
  const hydrated = useAppSelector((state) => state.auth.hydrated);

  useEffect(() => {
    if (!hydrated) {
      return undefined;
    }

    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 1500);

    return () => clearTimeout(timer);
  }, [hydrated, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿 Green Fibre</Text>
      <ActivityIndicator size="large" color="#2E7D32" style={styles.loader} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  loader: {
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
