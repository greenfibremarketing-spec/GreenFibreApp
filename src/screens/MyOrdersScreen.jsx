// ✅ No Redux/API changes - all functionality remains identical
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  FlatList,
  Dimensions,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { formatPrice } from "../utils/helpers";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchOrders } from "../store/thunks/orderThunks";

const { width } = Dimensions.get("window");

// FNP-Inspired Color Palette
const FNP_COLORS = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  accent: "#FFD700",
  gold: "#F57F17",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#F0F0F0",
  shadow: "rgba(0,0,0,0.08)",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#F44336",
  info: "#2196F3",
};

// FNP-Style Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "placed":
        return {
          icon: "time-outline",
          color: "#F57F17",
          bgColor: "#FFF8E1",
          label: "Placed",
        };
      case "confirmed":
      case "processing":
        return {
          icon: "time-outline",
          color: "#F57F17",
          bgColor: "#FFF8E1",
          label: "Processing",
        };
      case "shipped":
        return {
          icon: "car-outline",
          color: "#0D47A1",
          bgColor: "#E3F2FD",
          label: "Shipped",
        };
      case "delivered":
        return {
          icon: "checkmark-done-circle-outline",
          color: "#2E7D32",
          bgColor: "#E8F5E9",
          label: "Delivered",
        };
      case "cancelled":
        return {
          icon: "close-circle-outline",
          color: "#C62828",
          bgColor: "#FFEBEE",
          label: "Cancelled",
        };
      default:
        return {
          icon: "time-outline",
          color: "#F57F17",
          bgColor: "#FFF8E1",
          label: status?.replace(/_/g, " ") || "Pending",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

// FNP-Style Order Card Component
const OrderCard = ({ order, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(order._id || order.id);
  };

  const orderNumber = order.easebuzzOrderId || order.orderNumber || order._id || "ORD-0000";
  const orderDate = order.createdAt || new Date().toISOString();
  const orderItems = order.items || [];
  const orderTotal = order.finalAmount ?? order.total ?? order.totalAmount ?? 0;
  const orderStatus = order.orderStatus || order.status || "placed";
  const paymentStatus = order.paymentStatus || "pending";

  return (
    <Animated.View
      style={[
        styles.orderCardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        {/* FNP-Style Card Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberWrap}>
            <View style={styles.orderIconWrap}>
              <Ionicons
                name="receipt-outline"
                size={16}
                color={FNP_COLORS.primary}
              />
            </View>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
          <StatusBadge status={orderStatus} />
        </View>

        {paymentStatus === "pending" && (
          <Text style={styles.paymentPendingText}>Payment pending</Text>
        )}

        {/* FNP-Style Date & Items Count */}
        <View style={styles.orderMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#999" />
            <Text style={styles.orderDate}>
              {new Date(orderDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={14} color="#999" />
            <Text style={styles.orderItemsCount}>
              {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        {/* FNP-Style Order Items Preview */}
        {orderItems.length > 0 && (
          <View style={styles.orderItems}>
            {orderItems.slice(0, 3).map((item, index) => (
              <View key={item.productId || index} style={styles.itemWrap}>
                <Image
                  source={{
                    uri:
                      resolveImageUrl(item.image) ||
                      PLACEHOLDER_IMAGE,
                  }}
                  style={styles.itemThumb}
                  contentFit="cover"
                />
                {index === 2 && orderItems.length > 3 && (
                  <View style={styles.moreItems}>
                    <Text style={styles.moreText}>
                      +{orderItems.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* FNP-Style Card Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalWrap}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.orderTotal}>{formatPrice(orderTotal)}</Text>
          </View>
          <View style={styles.trackLink}>
            <Text style={styles.trackText}>Track Order</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={FNP_COLORS.primary}
            />
          </View>
        </View>

        {/* FNP-Style Progress Indicator */}
        {orderStatus !== "delivered" && orderStatus !== "cancelled" && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    orderStatus === "confirmed" || orderStatus === "processing"
                      ? "33%"
                      : orderStatus === "shipped"
                        ? "66%"
                        : "100%",
                },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// FNP-Style Empty State Component
const EmptyOrdersState = ({ navigation }) => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <LinearGradient
          colors={["#E8F5E9", "#C8E6C9"]}
          style={styles.emptyGradient}
        >
          <Ionicons
            name="receipt-outline"
            size={60}
            color={FNP_COLORS.primary}
          />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyMessage}>
        You haven't placed any orders yet. Start shopping sustainably!
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[FNP_COLORS.primary, FNP_COLORS.primaryDark]}
          style={styles.emptyBtnGradient}
        >
          <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
          <Text style={styles.emptyBtnText}>Start Shopping</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Authenticated order tracking info
const TrackSection = ({ navigation }) => {
  return (
    <View style={styles.trackSection}>
      <LinearGradient
        colors={["#F5F5F5", "#FFFFFF"]}
        style={styles.trackGradient}
      >
        <View style={styles.trackContent}>
          <View style={styles.trackIconWrap}>
            <Ionicons
              name="receipt-outline"
              size={24}
              color={FNP_COLORS.primary}
            />
          </View>
          <View style={styles.trackTextWrap}>
            <Text style={styles.trackTitle}>Track Your Orders</Text>
            <Text style={styles.trackSubtext}>
              Tap any order above to view delivery status and tracking details
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export function MyOrdersScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { orders, loading, pagination } = useAppSelector((s) => s.orders);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [dispatch, isAuthenticated]);

  const handleOrderPress = (orderId) => {
    navigation.navigate("TrackOrder", { orderId });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  };

  // FNP-Style Loading Screen
  if (loading) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="My Orders"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={FNP_COLORS.primary} />
            <Text style={styles.loadingText}>Loading your orders...</Text>
            <Text style={styles.loadingSubtext}>
              Please wait while we fetch your order history
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // FNP-Style Not Authenticated
  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="My Orders"
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <LinearGradient
              colors={["#FFEBEE", "#FFCDD2"]}
              style={styles.emptyGradient}
            >
              <Ionicons name="person-outline" size={60} color="#C62828" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyMessage}>
            Please sign in to view your orders and track deliveries.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[FNP_COLORS.primary, FNP_COLORS.primaryDark]}
              style={styles.emptyBtnGradient}
            >
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // FNP-Style Empty Orders
  if (!orders || orders.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="My Orders"
        scroll={false} // ✅ Add this to prevent nested ScrollView
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <FlatList
          data={[]}
          ListHeaderComponent={<EmptyOrdersState navigation={navigation} />}
          ListFooterComponent={<TrackSection navigation={navigation} />}
          contentContainerStyle={styles.emptyListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[FNP_COLORS.primary]}
            />
          }
        />
      </ScreenContainer>
    );
  }

  // Calculate stats safely
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => (o.orderStatus || o.status) === "delivered").length;
  const shippedOrders = orders.filter((o) => {
    const status = o.orderStatus || o.status;
    return status === "shipped" || status === "processing";
  }).length;

  // Render stats header
  const renderStatsHeader = () => (
    <View style={styles.statsBar}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{totalOrders}</Text>
        <Text style={styles.statLabel}>Total Orders</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{deliveredOrders}</Text>
        <Text style={styles.statLabel}>Delivered</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{shippedOrders}</Text>
        <Text style={styles.statLabel}>In Transit</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="My Orders"
      scroll={false} // ✅ Add this to prevent nested ScrollView
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* FNP-Style Order Cards with Stats as Header */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FNP_COLORS.primary]}
          />
        }
        ListHeaderComponent={renderStatsHeader()}
        ListFooterComponent={<TrackSection navigation={navigation} />}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // ⏳ Loading Styles
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    ...shadows.medium,
  },
  loadingText: {
    ...typography.body,
    fontWeight: "700",
    color: FNP_COLORS.text,
    marginTop: 20,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: FNP_COLORS.textLight,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },

  // 📊 Stats Bar
  statsBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.screen,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: spacing.screen,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: FNP_COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: FNP_COLORS.textLight,
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#F0F0F0",
  },

  paymentPendingText: {
    fontSize: 11,
    color: FNP_COLORS.warning,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  orderList: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 20,
  },

  // 🏷️ Order Card
  orderCardWrapper: {
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...shadows.small,
  },

  // 📝 Order Header
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumberWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: FNP_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "800",
    color: FNP_COLORS.text,
  },

  // 🏷️ Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // 📅 Order Meta
  orderMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  orderDate: {
    fontSize: 12,
    color: FNP_COLORS.textLight,
    fontWeight: "500",
  },
  orderItemsCount: {
    fontSize: 12,
    color: FNP_COLORS.textLight,
    fontWeight: "500",
  },

  // 🛍️ Order Items
  orderItems: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  itemWrap: {
    position: "relative",
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  moreItems: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // 💰 Order Footer
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  totalWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  totalLabel: {
    fontSize: 12,
    color: FNP_COLORS.textLight,
    fontWeight: "600",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "900",
    color: FNP_COLORS.primary,
  },
  trackLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trackText: {
    fontSize: 13,
    color: FNP_COLORS.primary,
    fontWeight: "700",
  },

  // 📊 Progress Bar
  progressBar: {
    marginTop: 12,
    height: 4,
    backgroundColor: "#F5F5F5",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: FNP_COLORS.primary,
    borderRadius: 2,
  },

  // 🚀 Empty State
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingTop: 60,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyIconWrap: {
    marginBottom: 24,
  },
  emptyGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    ...typography.h2,
    color: FNP_COLORS.text,
    fontSize: 24,
    marginBottom: 8,
  },
  emptyMessage: {
    ...typography.body,
    color: FNP_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  emptyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.medium,
  },
  emptyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  // 🔍 Track Section
  trackSection: {
    paddingVertical: 8,
    paddingHorizontal: spacing.screen,
    marginBottom: 20,
  },
  trackGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  trackContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  trackIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: FNP_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  trackTextWrap: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: FNP_COLORS.text,
  },
  trackSubtext: {
    fontSize: 11,
    color: FNP_COLORS.textLight,
    fontWeight: "500",
    marginTop: 2,
  },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: FNP_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  trackBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
