// src/navigation/DrawerNavigator.jsx
// Green Fibre — Premium Drawer Navigation

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Dimensions,
} from "react-native";
import { CustomAlert } from "../components/common/CustomAlert";
import { Image } from "expo-image";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { brand, footerBadges } from "../data/content";
import { images } from "../data/images";
import { colors, spacing, typography } from "../theme";
import { MainTabNavigator } from "./MainTabNavigator";
import { AboutScreen } from "../screens/AboutScreen";
import { BlogsScreen } from "../screens/BlogsScreen";
import { GalleryScreen } from "../screens/GalleryScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { TermsScreen } from "../screens/TermsScreen";
import { ShippingPolicyScreen } from "../screens/ShippingPolicyScreen";
import { RefundPolicyScreen } from "../screens/RefundPolicyScreen";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import { WishlistScreen } from "../screens/WishlistScreen";

const { width } = Dimensions.get("window");
const Drawer = createDrawerNavigator();

// Brand Drawer Colors
const drawerColors = {
  primary: colors.primary || "#1C4A2A",
  primaryLight: colors.primarySurface || "#F0F7F1",
  primaryDark: colors.primaryDark || "#122E1A",
  gold: "#D4A843",
  white: "#FFFFFF",
  cream: colors.cream || "#FAF7F0",
  creamDark: colors.creamDark || "#EDE8DF",
  text: colors.textPrimary || "#1A1A1A",
  textSecondary: colors.textSecondary || "#666666",
  textMuted: colors.textMuted || "#9E9E9E",
  borderLight: "rgba(28, 74, 42, 0.1)",
  danger: colors.error || "#C62828",
};

function CustomDrawerContent(props) {
  const { navigation } = props;
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    CustomAlert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            dispatch(logout());
            navigation.closeDrawer();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const safeNavigate = (routeName, params) => {
    navigation.closeDrawer();
    try {
      if (params) {
        navigation.navigate(routeName, params);
      } else {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate(routeName);
        } else {
          navigation.navigate(routeName);
        }
      }
    } catch (_) {
      navigation.navigate(routeName, params);
    }
  };

  const goToProfile = () => {
    if (isAuthenticated) {
      safeNavigate("Tabs", { screen: "Profile" });
    } else {
      safeNavigate("Login");
    }
  };

  const goToLogin = () => {
    safeNavigate("Login");
  };

  const goToSignup = () => {
    safeNavigate("Register");
  };

  return (
    <View style={styles.safeArea}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.drawerContent, { paddingTop: 0 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ===== HEADER BANNER ===== */}
          <LinearGradient
            colors={[drawerColors.primaryDark, drawerColors.primary]}
            style={[
              styles.drawerHeader,
              { paddingTop: Math.max(insets.top + 14, 38) },
            ]}
          >
            <View style={styles.drawerHeaderContent}>
              <View style={styles.drawerLogoContainer}>
                <Image
                  source={{ uri: images.logo }}
                  style={styles.drawerLogo}
                  contentFit="contain"
                />
                <View style={styles.drawerBrandBadge}>
                  <Text style={styles.drawerBrandText}>EST. 2024</Text>
                </View>
              </View>
              <Text style={styles.drawerTagline}>100% Sustainable Living</Text>
            </View>
          </LinearGradient>

          {/* ===== USER / AUTH SECTION ===== */}
          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.userSection}
              onPress={goToProfile}
              activeOpacity={0.8}
            >
              <View style={styles.userAvatarContainer}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.userAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={[drawerColors.primary, drawerColors.primaryDark]}
                    style={styles.userAvatarGradient}
                  >
                    <Text style={styles.userAvatarInitial}>
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  </LinearGradient>
                )}
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>{user?.name || "User"}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || "user@email.com"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={drawerColors.danger}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <View style={styles.authSection}>
              <Text style={styles.authTitle}>Welcome to Green Fibre</Text>
              <Text style={styles.authSubtitle}>
                Sign in to manage orders & wishlist
              </Text>
              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={[styles.authButton, styles.loginButton]}
                  onPress={goToLogin}
                >
                  <Text style={styles.authButtonText}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.authButton, styles.signupButton]}
                  onPress={goToSignup}
                >
                  <Text
                    style={[styles.authButtonText, styles.signupButtonText]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ===== DRAWER NAVIGATION ITEMS ===== */}
          <View style={styles.drawerItemsContainer}>
            <DrawerItemList {...props} />
          </View>

          <View style={styles.divider} />

          {/* ===== DRAWER FOOTER ===== */}
          <View style={styles.drawerFooter}>
            <View style={styles.footerBadges}>
              {footerBadges.map((badge, i) => (
                <View key={i} style={styles.badgeRow}>
                  <Ionicons name="leaf" size={12} color={drawerColors.primary} />
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>

            {/* Social Links */}
            <View style={styles.socialLinks}>
              <Text style={styles.socialTitle}>CONNECT WITH US</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://www.instagram.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("https://www.facebook.com/")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.socialIcon}
                  onPress={() => Linking.openURL("mailto:support@greenfibre.com")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="mail" size={20} color={drawerColors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.copyright}>
              © 2026 {brand.name || "Green Fibre"}
            </Text>
          </View>
        </Animated.View>
      </DrawerContentScrollView>
    </View>
  );
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        overlayColor: "rgba(18, 46, 26, 0.45)",
        drawerActiveTintColor: drawerColors.primary,
        drawerInactiveTintColor: drawerColors.textSecondary,
        drawerActiveBackgroundColor: drawerColors.primaryLight,
        drawerLabelStyle: {
          fontSize: 14,
          fontFamily: "DMSans_500Medium",
          marginLeft: -8,
        },
        drawerStyle: {
          backgroundColor: drawerColors.cream,
          width: Math.min(width * 0.82, 320),
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 4, height: 0 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 16,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 12,
          marginVertical: 2,
        },
        swipeEdgeWidth: 80,
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={MainTabNavigator}
        options={{
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          drawerLabel: "My Wishlist",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          drawerLabel: "About Us",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              size={size - 2}
              color={color}
            />
          ),
        }}
      />

      <Drawer.Screen
        name="Blogs"
        component={BlogsScreen}
        options={{
          drawerLabel: "Journal & Stories",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          drawerLabel: "Gallery",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="images-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          drawerLabel: "Contact Us",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          drawerLabel: "Privacy Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Terms"
        component={TermsScreen}
        options={{
          drawerLabel: "Terms & Conditions",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="ShippingPolicy"
        component={ShippingPolicyScreen}
        options={{
          drawerLabel: "Shipping Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size - 2} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="RefundPolicy"
        component={RefundPolicyScreen}
        options={{
          drawerLabel: "Refund Policy",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="return-down-back-outline"
              size={size - 2}
              color={color}
            />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: drawerColors.cream,
  },
  drawerContent: {
    flexGrow: 1,
    backgroundColor: drawerColors.cream,
    paddingTop: 0,
    paddingBottom: 20,
  },
  drawerHeader: {
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 8,
  },
  drawerHeaderContent: {
    alignItems: "flex-start",
  },
  drawerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  drawerLogo: {
    width: 100,
    height: 32,
  },
  drawerBrandBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  drawerBrandText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontFamily: "DMMono_500Medium",
    letterSpacing: 1,
  },
  drawerTagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
  },

  userSection: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: drawerColors.creamDark,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    alignItems: "center",
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 10,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: drawerColors.primary,
  },
  userAvatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: drawerColors.primaryLight,
  },
  userAvatarInitial: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#388E3C",
    borderWidth: 1.5,
    borderColor: drawerColors.creamDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: drawerColors.text,
  },
  userEmail: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: drawerColors.textMuted,
    marginTop: 1,
  },
  logoutButton: {
    padding: 6,
    backgroundColor: "rgba(198, 40, 40, 0.08)",
    borderRadius: 8,
  },

  authSection: {
    padding: 14,
    backgroundColor: drawerColors.creamDark,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    alignItems: "center",
  },
  authTitle: {
    fontSize: 14,
    fontFamily: "PlayfairDisplay_700Bold",
    color: drawerColors.text,
    marginBottom: 2,
  },
  authSubtitle: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: drawerColors.textSecondary,
    marginBottom: 10,
    textAlign: "center",
  },
  authButtons: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  authButton: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: drawerColors.primary,
  },
  signupButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: drawerColors.primary,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "DMSans_600SemiBold",
  },
  signupButtonText: {
    color: drawerColors.primary,
  },

  drawerItemsContainer: {
    flex: 1,
    paddingTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: drawerColors.borderLight,
    marginVertical: 8,
    marginHorizontal: 16,
  },

  drawerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  footerBadges: {
    marginBottom: 10,
    gap: 3,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: "DMSans_400Regular",
    color: drawerColors.textSecondary,
  },
  socialLinks: {
    marginTop: 6,
    marginBottom: 8,
  },
  socialTitle: {
    fontSize: 9,
    fontFamily: "DMMono_500Medium",
    color: drawerColors.textMuted,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: drawerColors.borderLight,
  },
  copyright: {
    fontSize: 10,
    fontFamily: "DMSans_400Regular",
    color: drawerColors.textMuted,
    marginTop: 4,
  },
});
