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
import { colors, spacing, typography, shadows } from "../../theme";

// FNP Brand Colors
const fnpColors = {
  primary: "#E91E63",
  primaryLight: "#FCE4EC",
  primaryDark: "#C2185B",
  secondary: "#4CAF50",
  secondaryLight: "#E8F5E9",
  secondaryDark: "#1B5E20",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#999999",
};

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
  hapticFeedback = true,
}) {
  const isDisabled = disabled || loading;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          gradient: [fnpColors.primary, fnpColors.primaryDark],
          textColor: fnpColors.white,
          containerStyle: styles.primaryContainer,
        };
      case "secondary":
        return {
          gradient: [fnpColors.secondary, fnpColors.secondaryDark],
          textColor: fnpColors.white,
          containerStyle: styles.secondaryContainer,
        };
      case "outline":
        return {
          gradient: null,
          textColor: fnpColors.primary,
          containerStyle: styles.outlineContainer,
          borderColor: fnpColors.primary,
        };
      case "ghost":
        return {
          gradient: null,
          textColor: fnpColors.primary,
          containerStyle: styles.ghostContainer,
        };
      case "danger":
        return {
          gradient: ["#DC2626", "#B91C1C"],
          textColor: fnpColors.white,
          containerStyle: styles.dangerContainer,
        };
      case "success":
        return {
          gradient: ["#16A34A", "#15803D"],
          textColor: fnpColors.white,
          containerStyle: styles.successContainer,
        };
      case "gold":
        return {
          gradient: ["#FFD700", "#F59E0B"],
          textColor: fnpColors.text,
          containerStyle: styles.goldContainer,
        };
      default:
        return {
          gradient: [fnpColors.primary, fnpColors.primaryDark],
          textColor: fnpColors.white,
          containerStyle: styles.primaryContainer,
        };
    }
  };

  const variantStyle = getVariantStyles();

  // Get size styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 12,
          iconSize: 16,
        };
      case "lg":
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 16,
          iconSize: 22,
        };
      default: // md
        return {
          paddingVertical: 14,
          paddingHorizontal: 24,
          fontSize: 15,
          iconSize: 20,
        };
    }
  };

  const sizeStyle = getSizeStyles();

  // Render button content
  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variantStyle.textColor}
          size={sizeStyle.iconSize}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && (
          <View style={[styles.iconWrapper, { marginRight: 8 }]}>
            {React.cloneElement(icon, {
              size: sizeStyle.iconSize,
              color: variantStyle.textColor,
            })}
          </View>
        )}
        <Text
          style={[
            styles.text,
            { color: variantStyle.textColor, fontSize: sizeStyle.fontSize },
            variant === "outline" && styles.textOutline,
            variant === "ghost" && styles.textGhost,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    );
  };

  // Render button with or without gradient
  const renderButton = () => {
    const buttonStyle = [
      styles.base,
      variantStyle.containerStyle,
      {
        paddingVertical: sizeStyle.paddingVertical,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        width: fullWidth ? "100%" : "auto",
        borderRadius: rounded ? spacing.pillRadius || 50 : 8,
        borderColor: variantStyle.borderColor,
        borderWidth: variant === "outline" ? 1.5 : 0,
        opacity: isDisabled ? 0.5 : 1,
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
          style={buttonStyle}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              width: "100%",
              borderRadius: rounded ? spacing.pillRadius || 50 : 8,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={variantStyle.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientContainer}
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
        activeOpacity={0.7}
        style={buttonStyle}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: "100%",
          }}
        >
          {renderContent()}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return renderButton();
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...(shadows?.soft || {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  gradientContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  // Variant Containers
  primaryContainer: {
    backgroundColor: fnpColors.primary,
  },
  secondaryContainer: {
    backgroundColor: fnpColors.secondary,
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: fnpColors.primary,
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },
  dangerContainer: {
    backgroundColor: "#DC2626",
  },
  successContainer: {
    backgroundColor: "#16A34A",
  },
  goldContainer: {
    backgroundColor: "#FFD700",
  },

  // Text Styles
  text: {
    ...(typography?.button || {
      fontWeight: "600",
      fontSize: 15,
    }),
    textAlign: "center",
  },
  textOutline: {
    color: fnpColors.primary,
  },
  textGhost: {
    color: fnpColors.primary,
  },
});
