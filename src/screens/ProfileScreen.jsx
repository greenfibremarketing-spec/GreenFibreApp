import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
  Share,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { brand, footerBadges } from "../data/content";
import { images } from "../data/images";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { performLogout } from "../store/thunks/authThunks";
import { selectCartBadgeCount } from "../store/slices/cartSlice";
import { selectWishlistCount } from "../store/slices/wishlistSlice";
// import Orders from "../../adminPanel/src/pages/Orders";

// FNP Brand Colors
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#FFD700",
  goldLight: "#FFF8E1",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textMuted: "#999999",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#F44336",
  warning: "#FF9800",
  cream: "#FFF8F0",
};

// Menu sections with icons and routes
const menuSections = [
  {
    title: "Account",
    items: [
      {
        icon: "receipt-outline",
        label: "My Orders",
        route: "Orders",
        onPress: (navigation) =>
          navigation.navigate("Tabs", { screen: "Orders" }),
      },
      {
        icon: "location-outline",
        label: "Track Order",
        route: "TrackOrder",
        onPress: (navigation) => navigation.navigate("TrackOrder"),
      },
      {
        icon: "heart-outline",
        label: "Wishlist",
        route: "Wishlist",
        badge: "wishlistCount",
        onPress: (navigation) => navigation.navigate("Wishlist"),
      },
      {
        icon: "cart-outline",
        label: "Cart",
        route: "Cart",
        badge: "cartCount",
        onPress: (navigation) => navigation.navigate("Cart"),
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: "information-circle-outline",
        label: "About Us",
        route: "About",
        onPress: (navigation) => navigation.navigate("About"),
      },
      {
        icon: "leaf-outline",
        label: "Sustainability",
        route: "Sustainability",
        onPress: (navigation) =>
          navigation.navigate("Tabs", { screen: "Sustainability" }),
      },
      {
        icon: "mail-outline",
        label: "Contact Us",
        route: "Contact",
        onPress: (navigation) => navigation.navigate("Contact"),
      },
      // {
      //   icon: "chatbubble-outline",
      //   label: "Live Chat",
      //   route: "Chat",
      //   onPress: () =>
      //     Alert.alert(
      //       "Live Chat",
      //       "Our support team is available 24/7 to help you!",
      //     ),
      // },
      // {
      //   icon: "help-circle-outline",
      //   label: "FAQ",
      //   route: "FAQ",
      //   onPress: () =>
      //     Alert.alert(
      //       "FAQ",
      //       "Frequently asked questions will be available soon!",
      //     ),
      // },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        icon: "shield-outline",
        label: "Privacy Policy",
        route: "PrivacyPolicy",
        onPress: (navigation) => navigation.navigate("PrivacyPolicy"),
      },
      {
        icon: "document-text-outline",
        label: "Terms & Conditions",
        route: "Terms",
        onPress: (navigation) => navigation.navigate("Terms"),
      },
      {
        icon: "car-outline",
        label: "Shipping Policy",
        route: "ShippingPolicy",
        onPress: (navigation) => navigation.navigate("ShippingPolicy"),
      },
      {
        icon: "return-down-back-outline",
        label: "Refund Policy",
        route: "RefundPolicy",
        onPress: (navigation) => navigation.navigate("RefundPolicy"),
      },
    ],
  },
];

export function ProfileScreen() {
  const drawerNav = useNavigation();
  const stackNav = useNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const cartCount = useAppSelector(selectCartBadgeCount);
  const { orders, loading } = useAppSelector((s) => s.orders);
  const totalOrders = orders.length;
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await dispatch(performLogout()).unwrap();
          let parent = stackNav;
          while (parent?.getParent?.()) {
            parent = parent.getParent();
          }
          parent?.navigate?.("Login");
        },
      },
    ]);
  };

  // Share app
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌿 Discover sustainable products with ${brand.name}! Download the app now and start your eco-friendly journey.\n\nDownload: https://greenfibre.com/app`,
        title: `Share ${brand.name}`,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share at the moment.");
    }
  };

  // Render menu items
  const renderMenuItem = (item, index, sectionIndex) => {
    const isLast = index === menuSections[sectionIndex].items.length - 1;

    // Get badge value
    let badgeValue = null;
    if (item.badge === "wishlistCount" && wishlistCount > 0) {
      badgeValue = wishlistCount;
    } else if (item.badge === "cartCount" && cartCount > 0) {
      badgeValue = cartCount;
    }

    return (
      <TouchableOpacity
        key={index}
        style={[styles.menuItem, isLast && styles.menuItemLast]}
        onPress={() => {
          if (item.onPress) {
            // Pass the appropriate navigation based on the route
            const nav =
              item.route === "Cart" ||
              item.route === "TrackOrder" ||
              item.route === "EditProfile"
                ? stackNav
                : drawerNav;
            item.onPress(nav);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.menuLeft}>
          <View style={styles.menuIconWrap}>
            <LinearGradient
              colors={[fnpColors.primaryLight, "#C8E6C9"]}
              style={styles.menuIconGradient}
            >
              <Ionicons name={item.icon} size={20} color={fnpColors.primary} />
            </LinearGradient>
          </View>
          <Text style={styles.menuLabel}>{item.label}</Text>
        </View>
        <View style={styles.menuRight}>
          {badgeValue && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeValue}</Text>
            </View>
          )}
          <Ionicons
            name="chevron-forward"
            size={18}
            color={fnpColors.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="Profile"
      headerRight={
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={22} color={fnpColors.text} />
        </TouchableOpacity>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* ===== PROFILE CARD ===== */}
        <View style={styles.profileCard}>
          {isAuthenticated && user ? (
            <>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[fnpColors.primary, fnpColors.primaryDark]}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </Text>
                </LinearGradient>
                <View style={styles.avatarBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={fnpColors.success}
                  />
                </View>
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.userName}>{user.name || "User"}</Text>
              <Text style={styles.userEmail}>
                {user.email || "user@email.com"}
              </Text>

              <View style={styles.userStats}>
                <View style={styles.userStat}>
                  <Text style={styles.userStatNumber}>{totalOrders}</Text>
                  <Text style={styles.userStatLabel}>Orders</Text>
                </View>
                <View style={styles.userStatDivider} />
                <View style={styles.userStat}>
                  <Text style={styles.userStatNumber}>{wishlistCount}</Text>
                  <Text style={styles.userStatLabel}>Wishlist</Text>
                </View>
                <View style={styles.userStatDivider} />
                <View style={styles.userStat}>
                  <Text style={styles.userStatNumber}>{cartCount}</Text>
                  <Text style={styles.userStatLabel}>Cart</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.guestAvatar}>
                <Ionicons
                  name="person-outline"
                  size={40}
                  color={fnpColors.white}
                />
              </View>
              <Text style={styles.guestTitle}>
                Welcome to {brand.name || "Green Fibre"}
              </Text>
              <Text style={styles.guestText}>
                Sign in to access your orders, wishlist, and personalized
                experience.
              </Text>
              <Button
                title="Sign In"
                onPress={() => stackNav.navigate("Login")}
                style={styles.signInBtn}
              />
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => stackNav.navigate("Register")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLinkText}>Create Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ===== MENU SECTIONS ===== */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{section.title}</Text>
            {section.items.map((item, index) =>
              renderMenuItem(item, index, sectionIndex),
            )}
          </View>
        ))}

        {/* ===== SIGN OUT BUTTON ===== */}
        {isAuthenticated && (
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["#FFEBEE", "#FFCDD2"]}
              style={styles.signOutGradient}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color={fnpColors.danger}
              />
              <Text style={styles.signOutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ===== BADGES ===== */}
        <View style={styles.badges}>
          {footerBadges.map((badge, i) => (
            <View key={i} style={styles.badgeItem}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.badgeIconWrap}
              >
                <Ionicons name="leaf" size={12} color="#2E7D32" />
              </LinearGradient>
              <Text style={styles.badgeLabel}>{badge}</Text>
            </View>
          ))}
        </View>

        {/* ===== VERSION INFO ===== */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 2.4.1</Text>
          <View style={styles.versionDot} />
          <Text style={styles.versionText}>Made with ❤️</Text>
        </View>

        {/* ===== COPYRIGHT ===== */}
        <Text style={styles.copyright}>
          © 2026 {brand.name || "Green Fibre"}. All rights reserved.
        </Text>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== PROFILE CARD =====
  profileCard: {
    alignItems: "center",
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius || 20,
    padding: spacing.xxl || 24,
    margin: spacing.screen || 16,
    ...(shadows?.soft || {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    }),
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.md || 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: fnpColors.white,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: fnpColors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: fnpColors.white,
  },
  editAvatarBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: fnpColors.white,
  },
  userName: {
    ...(typography?.h2 || { fontSize: 20, fontWeight: "700" }),
    color: fnpColors.text,
    marginBottom: 4,
  },
  userEmail: {
    ...(typography?.body || { fontSize: 14 }),
    color: fnpColors.textMuted,
    marginBottom: spacing.md || 16,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: fnpColors.cream,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  userStat: {
    flex: 1,
    alignItems: "center",
  },
  userStatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.primary,
  },
  userStatLabel: {
    fontSize: 11,
    color: fnpColors.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  userStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: fnpColors.borderLight,
  },

  // ===== GUEST =====
  guestAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: fnpColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md || 16,
  },
  guestTitle: {
    ...(typography?.h3 || { fontSize: 18, fontWeight: "600" }),
    color: fnpColors.text,
    marginBottom: spacing.sm || 8,
  },
  guestText: {
    ...(typography?.body || { fontSize: 14 }),
    color: fnpColors.textMuted,
    textAlign: "center",
    marginBottom: spacing.lg || 16,
  },
  signInBtn: {
    width: "100%",
    marginBottom: spacing.md || 16,
    backgroundColor: fnpColors.primary,
    borderRadius: 14,
  },
  registerLink: {
    paddingVertical: 8,
  },
  registerLinkText: {
    ...(typography?.body || { fontSize: 14 }),
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== MENU SECTIONS =====
  menuSection: {
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius || 20,
    marginHorizontal: spacing.screen || 16,
    marginBottom: spacing.md || 16,
    ...(shadows?.soft || {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    }),
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    overflow: "hidden",
  },
  menuSectionTitle: {
    ...(typography?.bodySmall || { fontSize: 12 }),
    color: fnpColors.textMuted,
    fontWeight: "600",
    paddingHorizontal: spacing.lg || 16,
    paddingTop: spacing.md || 12,
    paddingBottom: spacing.xs || 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg || 16,
    paddingVertical: spacing.md || 14,
    borderBottomWidth: 1,
    borderBottomColor: fnpColors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md || 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  menuIconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    ...(typography?.body || { fontSize: 14 }),
    color: fnpColors.text,
    fontWeight: "500",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm || 8,
  },
  badge: {
    backgroundColor: fnpColors.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: fnpColors.white,
    fontSize: 11,
    fontWeight: "700",
  },

  // ===== SIGN OUT =====
  signOutBtn: {
    marginHorizontal: spacing.screen || 16,
    marginTop: spacing.md || 16,
    borderRadius: 14,
    overflow: "hidden",
  },
  signOutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm || 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  signOutText: {
    ...(typography?.body || { fontSize: 14 }),
    color: fnpColors.danger,
    fontWeight: "600",
  },

  // ===== BADGES =====
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md || 12,
    padding: spacing.screen || 16,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: fnpColors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...(shadows?.small || {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  badgeIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLabel: {
    ...(typography?.bodySmall || { fontSize: 12 }),
    color: fnpColors.textMuted,
    fontWeight: "500",
  },

  // ===== VERSION =====
  versionInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md || 12,
    gap: 8,
  },
  versionText: {
    ...(typography?.bodySmall || { fontSize: 10 }),
    color: fnpColors.textMuted,
  },
  versionDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: fnpColors.textMuted,
  },

  // ===== COPYRIGHT =====
  copyright: {
    ...(typography?.bodySmall || { fontSize: 11 }),
    color: fnpColors.textMuted,
    textAlign: "center",
    paddingBottom: spacing.xxxl || 32,
  },
  bottomSpacer: {
    height: 20,
  },
});

// Default export for backward compatibility
// export default ProfileScreen;
