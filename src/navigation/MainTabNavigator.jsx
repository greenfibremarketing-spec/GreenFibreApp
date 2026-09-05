import React, { useRef, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity, // ✅ ADD THIS - it was missing!
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography } from "../theme";
import { ShopScreen } from "../screens/ShopScreen";
import { SustainabilityScreen } from "../screens/SustainabilityScreen";
import { MyOrdersScreen } from "../screens/MyOrdersScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
// import HomeScreen from "../screens/HomeScreen"; // ✅ Default import (no curly braces)
import { configureReanimatedLogger } from "react-native-reanimated";
import HomeScreen from "../screens/HomeScreen.jsx";
import { useAppSelector } from "../store/hooks";
import { selectCartBadgeCount } from "../store/slices/cartSlice";

const Tab = createBottomTabNavigator();

// Premium Green Fibre tab colors
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#D4A843",
  white: "#FFFFFF",
  cream: "#FDFBF7",
  borderLight: "#E8E3DA",
  shadow: "rgba(43, 30, 10, 0.06)",
  textLight: "#9E9E9E",
  text: "#2C2C2C",
  green: "#388E3C",
};

// Custom Tab Bar Button Component with Badge
const TabBarButton = ({
  children,
  onPress,
  accessibilityState,
  route,
  badgeCount,
}) => {
  const focused = accessibilityState.selected;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: -4,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [focused]);

  // Get icon name based on route
  const getIconName = () => {
    const iconMap = {
      Home: focused ? "home" : "home-outline",
      Shop: focused ? "cart" : "cart-outline",
      Sustainability: focused ? "leaf" : "leaf-outline",
      Orders: focused ? "receipt" : "receipt-outline",
      Profile: focused ? "person" : "person-outline",
    };
    return iconMap[route.name] || "home-outline";
  };

  // Get icon color
  const getIconColor = () => {
    if (route.name === "Sustainability") {
      return focused ? fnpColors.green : fnpColors.textLight;
    }
    return focused ? fnpColors.primary : fnpColors.textLight;
  };

  // Get label
  const getLabel = () => {
    const labelMap = {
      Home: "Home",
      Shop: "Shop",
      Sustainability: "Impact",
      Orders: "Orders",
      Profile: "Profile",
    };
    return labelMap[route.name] || route.name;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          {
            transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={getIconName()} size={26} color={getIconColor()} />
          {badgeCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {badgeCount > 99 ? "99+" : badgeCount}
              </Text>
            </View>
          )}
          {focused && <View style={styles.activeIndicator} />}
        </View>
        <Text
          style={[
            styles.tabLabel,
            focused && styles.tabLabelActive,
            route.name === "Sustainability" && focused && styles.tabLabelGreen,
          ]}
        >
          {getLabel()}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export function MainTabNavigator() {
  const cartBadgeCount = useAppSelector(selectCartBadgeCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: fnpColors.primary,
        tabBarInactiveTintColor: fnpColors.textLight,
        tabBarStyle: {
          backgroundColor: fnpColors.cream,
          borderTopColor: fnpColors.borderLight,
          height: Platform.OS === "ios" ? 85 : 75,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: "rgba(43, 30, 10, 0.15)",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          borderTopWidth: 1,
          borderTopColor: fnpColors.borderLight,
        },
        tabBarLabelStyle: {
          ...typography.bodySmall,
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            Home: focused ? "home" : "home-outline",
            Shop: focused ? "cart" : "cart-outline",
            Sustainability: focused ? "leaf" : "leaf-outline",
            Orders: focused ? "receipt" : "receipt-outline",
            Profile: focused ? "person" : "person-outline",
          };

          const iconColors = {
            Sustainability: focused ? fnpColors.green : fnpColors.textLight,
          };

          const iconColor = iconColors[route.name] || color;

          return (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={iconMap[route.name]}
                size={26}
                color={iconColor}
              />
              {route.name === "Shop" && cartBadgeCount > 0 && (
                <View
                  style={[styles.badgeContainer, styles.badgeContainerCart]}
                >
                  <Text style={styles.badgeText}>
                    {cartBadgeCount > 99 ? "99+" : cartBadgeCount}
                  </Text>
                </View>
              )}
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      {/* <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      /> */}

      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: "Shop",
        }}
      />

      <Tab.Screen
        name="Sustainability"
        component={SustainabilityScreen}
        options={{
          tabBarLabel: "Impact",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.iconWrapper}>
              <Ionicons
                name={focused ? "leaf" : "leaf-outline"}
                size={26}
                color={focused ? fnpColors.green : fnpColors.textLight}
              />
              {focused && (
                <View
                  style={[styles.activeIndicator, styles.activeIndicatorGreen]}
                />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Orders"
        component={MyOrdersScreen}
        options={{
          tabBarLabel: "Orders",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: fnpColors.primary,
  },
  activeIndicatorGreen: {
    backgroundColor: fnpColors.green,
  },
  badgeContainer: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: fnpColors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: fnpColors.white,
  },
  badgeContainerCart: {
    backgroundColor: fnpColors.green,
  },
  badgeText: {
    color: fnpColors.white,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 14,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: fnpColors.textLight,
    marginTop: 2,
  },
  tabLabelActive: {
    color: fnpColors.primary,
    fontWeight: "600",
  },
  tabLabelGreen: {
    color: fnpColors.green,
  },
  tabIconActive: {
    transform: [{ scale: 1.05 }],
  },
});
