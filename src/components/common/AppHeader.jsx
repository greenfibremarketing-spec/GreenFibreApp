import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "../../store/hooks";
import { selectCartBadgeCount } from "../../store/slices/cartSlice";
import { images } from "../../data/images";
import { colors, spacing, shadows, typography } from "../../theme";
import { OfferBar } from "./OfferBar";
export function AppHeader({
  showOfferBar = true,
  showMenu = true,
  title,
  onMenuPress,
  style,
}) {
  const navigation = useNavigation();
  const cartCount = useAppSelector(selectCartBadgeCount);
  return (
    <View style={[styles.wrapper, style]}>
      {showOfferBar && <OfferBar />}
      <View style={styles.header}>
        {showMenu && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onMenuPress}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.logoWrap}
          onPress={() => navigation.navigate("Main")}
        >
          {title ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            <Image
              source={{ uri: images.logo }}
              style={styles.logo}
              contentFit="contain"
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("Cart")}
          accessibilityLabel="Open cart"
        >
          <Ionicons
            name="cart-outline"
            size={24}
            color={colors.textSecondary}
          />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 9 ? "9+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    height: 60,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: spacing.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
  },
  logo: {
    width: 140,
    height: 40,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
});
