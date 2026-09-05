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
            <Ionicons name="menu" size={22} color={colors.text} />
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
            name="bag-outline"
            size={22}
            color={colors.text}
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
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    height: 52,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.creamDark,
  },
  logoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  logo: {
    width: 130,
    height: 36,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.cream,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
});
