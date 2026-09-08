// src/components/common/Button.jsx
// Premium Green Fibre button system:
// - primary: deep forest gradient
// - outline: terracotta border
// - whatsapp: WhatsApp green pill
// - ghost: transparent
// - danger: warm red

import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing } from "../../theme";

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
  rounded = true,
}) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  // Variant config
  const getVariant = () => {
    switch (variant) {
      case "primary":
        return {
          gradient: [colors.primary, colors.primaryLight],
          textColor: "#FDFCF9",
          containerBg: colors.primary,
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "secondary":
        return {
          gradient: [colors.primaryLight, colors.primary],
          textColor: "#FDFCF9",
          containerBg: colors.primaryLight,
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "outline":
        return {
          gradient: null,
          textColor: colors.primary,
          containerBg: "transparent",
          borderColor: colors.terracotta,
          borderWidth: 1.5,
        };
      case "outlineGreen":
        return {
          gradient: null,
          textColor: colors.primary,
          containerBg: "transparent",
          borderColor: colors.primary,
          borderWidth: 1.5,
        };
      case "ghost":
        return {
          gradient: null,
          textColor: colors.primary,
          containerBg: "transparent",
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "danger":
        return {
          gradient: [colors.error, "#7D1A10"],
          textColor: "#FDFCF9",
          containerBg: colors.error,
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "whatsapp":
        return {
          gradient: [colors.whatsapp, colors.whatsappDark],
          textColor: "#FFFFFF",
          containerBg: colors.whatsapp,
          borderColor: "transparent",
          borderWidth: 0,
        };
      case "terracotta":
        return {
          gradient: [colors.terracotta, colors.terracottaDark],
          textColor: "#FDFCF9",
          containerBg: colors.terracotta,
          borderColor: "transparent",
          borderWidth: 0,
        };
      default:
        return {
          gradient: [colors.primary, colors.primaryLight],
          textColor: "#FDFCF9",
          containerBg: colors.primary,
          borderColor: "transparent",
          borderWidth: 0,
        };
    }
  };

  // Size config
  const getSize = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: 13, iconSize: 16, borderRadius: 10 };
      case "lg":
        return { paddingVertical: 17, paddingHorizontal: 36, fontSize: 16, iconSize: 22, borderRadius: 16 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 26, fontSize: 15, iconSize: 20, borderRadius: 14 };
    }
  };

  const variantStyle = getVariant();
  const sizeStyle = getSize();
  const borderRadius = rounded ? 50 : sizeStyle.borderRadius;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={variantStyle.textColor} size="small" />;
    }
    return (
      <View style={styles.contentRow}>
        {icon && (
          <View style={{ marginRight: 8 }}>
            {React.cloneElement(icon, { size: sizeStyle.iconSize, color: variantStyle.textColor })}
          </View>
        )}
        <Text
          style={[
            styles.text,
            {
              color: variantStyle.textColor,
              fontSize: sizeStyle.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    );
  };

  const commonStyle = [
    styles.base,
    {
      paddingVertical: sizeStyle.paddingVertical,
      paddingHorizontal: sizeStyle.paddingHorizontal,
      borderRadius,
      borderColor: variantStyle.borderColor,
      borderWidth: variantStyle.borderWidth,
      width: fullWidth ? "100%" : "auto",
      opacity: isDisabled ? 0.45 : 1,
      backgroundColor: variantStyle.containerBg,
    },
    style,
  ];

  if (variantStyle.gradient && !isDisabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={1}
        style={[styles.base, { borderRadius, width: fullWidth ? "100%" : "auto", opacity: isDisabled ? 0.45 : 1 }, style]}
      >
        <Animated.View style={{ width: "100%", transform: [{ scale: scaleAnim }], borderRadius, overflow: "hidden" }}>
          <LinearGradient
            colors={variantStyle.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { width: "100%", paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal }]}
          >
            {renderContent()}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={commonStyle}
    >
      <Animated.View style={{ width: "100%", alignItems: "center", justifyContent: "center", transform: [{ scale: scaleAnim }] }}>
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  gradient: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
