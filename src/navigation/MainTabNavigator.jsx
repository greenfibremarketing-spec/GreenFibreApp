// src/navigation/MainTabNavigator.jsx
// Green Fibre — Compact, Aesthetic, Ultra-Smooth Bottom Navigation

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors, typography } from "../theme";
import HomeScreen from "../screens/HomeScreen.jsx";
import { ShopScreen } from "../screens/ShopScreen";
import { SustainabilityScreen } from "../screens/SustainabilityScreen";
import { MyOrdersScreen } from "../screens/MyOrdersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useAppSelector } from "../store/hooks";
import { selectCartBadgeCount } from "../store/slices/cartSlice";

const Tab = createBottomTabNavigator();

// Tab routes definition
const TAB_CONFIG = {
  Home: {
    label: "Home",
    iconActive: "home",
    iconInactive: "home-outline",
  },
  Shop: {
    label: "Shop",
    iconActive: "bag-handle",
    iconInactive: "bag-handle-outline",
  },
  Sustainability: {
    label: "Impact",
    iconActive: "leaf",
    iconInactive: "leaf-outline",
  },
  Orders: {
    label: "Orders",
    iconActive: "receipt",
    iconInactive: "receipt-outline",
  },
  Profile: {
    label: "Profile",
    iconActive: "person",
    iconInactive: "person-outline",
  },
};

// ── Single Animated Tab Item ──────────────────────────────────────────────
function TabBarItem({
  route,
  isFocused,
  onPress,
  onLongPress,
  badgeCount = 0,
}) {
  const config = TAB_CONFIG[route.name] || {
    label: route.name,
    iconActive: "ellipse",
    iconInactive: "ellipse-outline",
  };

  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.95)).current;
  const pillOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const translateYAnim = useRef(new Animated.Value(isFocused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.06 : 0.96,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: isFocused ? -2 : 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(pillOpacity, {
        toValue: isFocused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      try {
        Haptics.selectionAsync();
      } catch (_) {}
    }
    onPress();
  };

  const isImpact = route.name === "Sustainability";
  const activeColor = colors.primary; // Forest green #1C4A2A
  const inactiveColor = colors.textLight || "#8F958E";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={config.label}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.tabItemContent,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
            ],
          },
        ]}
      >
        {/* Subtle pill highlight behind active icon */}
        <Animated.View
          style={[
            styles.activePill,
            {
              opacity: pillOpacity,
              backgroundColor: isImpact
                ? "rgba(46, 125, 50, 0.12)"
                : "rgba(28, 74, 42, 0.08)",
            },
          ]}
        />

        {/* Icon with badge */}
        <View style={styles.iconWrap}>
          <Ionicons
            name={isFocused ? config.iconActive : config.iconInactive}
            size={21}
            color={isFocused ? activeColor : inactiveColor}
          />

          {/* Cart Badge */}
          {route.name === "Shop" && badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </Text>
            </View>
          )}
        </View>

        {/* Crisp compact label */}
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? activeColor : inactiveColor,
              fontWeight: isFocused ? "600" : "500",
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>

        {/* Small aesthetic indicator dot */}
        <Animated.View
          style={[
            styles.indicatorDot,
            {
              opacity: pillOpacity,
              backgroundColor: activeColor,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Custom Floating / Sleek Tab Bar ─────────────────────────────────────────
function CustomBottomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const cartBadgeCount = useAppSelector(selectCartBadgeCount);

  // Bottom padding handles iPhone home indicator cleanly without being excessively tall
  const bottomPadding = Math.max(insets.bottom > 0 ? insets.bottom - 4 : 6, 6);

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: bottomPadding,
          height: 54 + bottomPadding,
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TabBarItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
              badgeCount={route.name === "Shop" ? cartBadgeCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Main Navigator Component ─────────────────────────────────────────────────
export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Sustainability" component={SustainabilityScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: colors.cream || "#FAF7F0",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(28, 74, 42, 0.1)",
    shadowColor: "rgba(28, 74, 42, 0.12)",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    justifyContent: "center",
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    height: 52,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  tabItemContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: -2,
    width: 44,
    height: 28,
    borderRadius: 14,
    zIndex: 0,
  },
  iconWrap: {
    width: 28,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    fontFamily: "DMSans_500Medium",
    letterSpacing: 0.2,
    marginTop: 2,
    zIndex: 1,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: colors.terracotta || "#B85C3A",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.cream || "#FAF7F0",
    zIndex: 2,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    fontFamily: "DMSans_700Bold",
    lineHeight: 11,
  },
});
