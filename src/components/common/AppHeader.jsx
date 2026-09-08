// src/components/common/AppHeader.jsx
// Premium Green Fibre header:
// - Logo LEFT-aligned (not centred)
// - Inline expanding search bar (no screen push)
// - Cart badge uses terracotta accent
// - 56px height, circular 36px icon buttons

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Keyboard,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
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
  showSearch = true,
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const cartCount = useAppSelector(selectCartBadgeCount);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const handleMenuClick = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}

    if (typeof onMenuPress === "function") {
      try {
        onMenuPress();
        return;
      } catch (_) {}
    }
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch (_) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    Animated.spring(searchAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    Animated.spring(searchAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start(() => setSearchOpen(false));
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      closeSearch();
      navigation.navigate("Shop", { search: searchQuery.trim() });
    }
  };

  const searchBarWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "72%"],
  });

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }, style]}>
      {showOfferBar && <OfferBar />}
      <View style={styles.header}>
        {/* Menu button — always visible */}
        {showMenu && !searchOpen && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleMenuClick}
            accessibilityLabel="Open menu"
          >
            <Ionicons name="menu" size={20} color={colors.text} />
          </TouchableOpacity>
        )}

        {/* Logo — LEFT aligned, shrinks when search open */}
        {!searchOpen && (
          <TouchableOpacity
            style={styles.logoWrap}
            onPress={() => navigation.navigate("Main")}
            activeOpacity={0.85}
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
        )}

        {/* Inline expanding search bar */}
        {searchOpen && (
          <Animated.View style={[styles.searchBar, { width: searchBarWidth }]}>
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <TextInput
              ref={inputRef}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Search products…"
              placeholderTextColor={colors.textLight}
              returnKeyType="search"
              style={styles.searchInput}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={closeSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Right icons */}
        <View style={styles.rightIcons}>
          {/* Search icon — opens inline bar */}
          {showSearch && !searchOpen && (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={openSearch}
              accessibilityLabel="Search products"
            >
              <Ionicons name="search-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          )}

          {/* Cart — terracotta badge */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate("Cart")}
            accessibilityLabel="Open cart"
          >
            <Ionicons name="bag-outline" size={20} color={colors.text} />
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
    paddingHorizontal: spacing.screen,
    height: 56,
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.creamDark,
  },
  logoWrap: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    height: 40,
  },
  logo: {
    width: 120,
    height: 34,
  },
  title: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: colors.text,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
  },
  // Inline search bar
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.text,
    padding: 0,
  },
  badge: {
    position: "absolute",
    top: 1,
    right: 1,
    backgroundColor: colors.terracotta,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.cream,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: "DMSans_700Bold",
  },
});
