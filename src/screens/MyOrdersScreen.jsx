// src/screens/MyOrdersScreen.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
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
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchOrders } from "../store/thunks/orderThunks";

const { width } = Dimensions.get("window");

// FNP-Inspired Brand Colors
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
  warning: "#D97706",
  warningLight: "#FFFBEB",
  danger: "#F44336",
  info: "#2196F3",
};

// FNP-Style Status Badge Component
const StatusBadge = ({ orderStatus, paymentStatus, paymentMethod }) => {
  const isPendingPayment =
    paymentStatus === "pending" && (paymentMethod || "").toLowerCase() !== "cod";

  const getStatusConfig = () => {
    if (isPendingPayment || paymentStatus === "failed") {
      return {
        icon: "alert-circle-outline",
        color: "#D97706",
        bgColor: "#FFFBEB",
        label: "Payment Pending",
      };
    }

    switch (orderStatus?.toLowerCase()) {
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
          icon: "sync-outline",
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
          label: orderStatus?.replace(/_/g, " ") || "Pending",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Ionicons name={config.icon} size={13} color={config.color} />
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

// Order Card Component with Tab Context
const OrderCard = ({ order, onPress, tabKey }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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

  const orderNumber =
    order.razorpayOrderId || order.orderNumber || order._id || "ORD-0000";
  const orderDate = order.createdAt || new Date().toISOString();
  const orderItems = order.items || [];
  const orderTotal = order.finalAmount ?? order.total ?? order.totalAmount ?? 0;
  const orderStatus = (order.orderStatus || order.status || "placed").toLowerCase();
  const paymentStatus = (order.paymentStatus || "pending").toLowerCase();
  const paymentMethod = order.paymentMethod || "Online";
  const isPendingPayment =
    paymentStatus === "pending" && (paymentMethod || "").toLowerCase() !== "cod";

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
        style={[
          styles.orderCard,
          isPendingPayment && styles.orderCardPending,
        ]}
        activeOpacity={0.88}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        {/* Card Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberWrap}>
            <View
              style={[
                styles.orderIconWrap,
                isPendingPayment && { backgroundColor: "#FEF3C7" },
              ]}
            >
              <Ionicons
                name={isPendingPayment ? "wallet-outline" : "receipt-outline"}
                size={16}
                color={isPendingPayment ? "#D97706" : FNP_COLORS.primary}
              />
            </View>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
          <StatusBadge
            orderStatus={orderStatus}
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
          />
        </View>

        {/* Pending Payment Alert Banner */}
        {isPendingPayment && (
          <View style={styles.pendingAlertBox}>
            <Ionicons name="information-circle" size={15} color="#D97706" />
            <Text style={styles.pendingAlertText}>
              Payment was not completed. Tap to view or complete payment.
            </Text>
          </View>
        )}

        {/* Date & Items Count */}
        <View style={styles.orderMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color="#999" />
            <Text style={styles.orderDate}>
              {new Date(orderDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="cube-outline" size={13} color="#999" />
            <Text style={styles.orderItemsCount}>
              {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="card-outline" size={13} color="#999" />
            <Text style={styles.orderDate}>
              {paymentMethod.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        {orderItems.length > 0 && (
          <View style={styles.orderItems}>
            {orderItems.slice(0, 3).map((item, index) => (
              <View key={item.productId || index} style={styles.itemWrap}>
                <Image
                  source={{
                    uri: resolveImageUrl(item.image) || PLACEHOLDER_IMAGE,
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

        {/* Card Footer */}
        <View style={styles.orderFooter}>
          <View style={styles.totalWrap}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text
              style={[
                styles.orderTotal,
                isPendingPayment && { color: "#D97706" },
              ]}
            >
              {formatPrice(orderTotal)}
            </Text>
          </View>
          {isPendingPayment ? (
            <TouchableOpacity
              style={styles.payNowBadgeBtn}
              onPress={handlePress}
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={14} color="#FFFFFF" />
              <Text style={styles.payNowBadgeBtnText}>Pay Now</Text>
              <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.trackLink}>
              <Text style={styles.trackText}>
                {orderStatus === "delivered" ? "View Receipt" : "Track Order"}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={15}
                color={FNP_COLORS.primary}
              />
            </View>
          )}
        </View>

        {/* Progress Indicator for Active Orders */}
        {!isPendingPayment &&
          orderStatus !== "delivered" &&
          orderStatus !== "cancelled" && (
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

// Tab Empty State Component
const TabEmptyState = ({ tabKey, navigation }) => {
  const getEmptyConfig = () => {
    switch (tabKey) {
      case "active":
        return {
          icon: "cube-outline",
          title: "No Active Orders",
          message: "You don't have any orders in transit or processing right now.",
          showShopBtn: true,
          color: FNP_COLORS.primary,
          bgColors: ["#E8F5E9", "#C8E6C9"],
        };
      case "history":
        return {
          icon: "receipt-outline",
          title: "No Order History",
          message: "Past delivered orders will appear here once completed.",
          showShopBtn: true,
          color: FNP_COLORS.primary,
          bgColors: ["#E8F5E9", "#C8E6C9"],
        };
      case "pending":
        return {
          icon: "shield-checkmark-outline",
          title: "No Pending Payments",
          message: "All your orders are confirmed and up to date! ✨",
          showShopBtn: false,
          color: "#D97706",
          bgColors: ["#FFFBEB", "#FEF3C7"],
        };
      default:
        return {
          icon: "receipt-outline",
          title: "No Orders Found",
          message: "Start shopping our conscious collection.",
          showShopBtn: true,
          color: FNP_COLORS.primary,
          bgColors: ["#E8F5E9", "#C8E6C9"],
        };
    }
  };

  const config = getEmptyConfig();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <LinearGradient colors={config.bgColors} style={styles.emptyGradient}>
          <Ionicons name={config.icon} size={54} color={config.color} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>{config.title}</Text>
      <Text style={styles.emptyMessage}>{config.message}</Text>
      {config.showShopBtn && (
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[FNP_COLORS.primary, FNP_COLORS.primaryDark]}
            style={styles.emptyBtnGradient}
          >
            <Ionicons name="leaf-outline" size={18} color="#FFFFFF" />
            <Text style={styles.emptyBtnText}>Explore Shop</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

export function MyOrdersScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { orders, loading } = useAppSelector((s) => s.orders);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [activeTab, setActiveTab] = useState("active");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders());
    }
  }, [dispatch, isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchOrders());
    setRefreshing(false);
  };

  const handleOrderPress = (orderId) => {
    navigation.navigate("TrackOrder", { orderId });
  };

  // ── 1. ACTIVE ORDERS (Paid or COD, In Transit / Processing) ──
  const activeOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const orderStatus = (o.orderStatus || o.status || "").toLowerCase();
      const paymentStatus = (o.paymentStatus || "").toLowerCase();
      const paymentMethod = (o.paymentMethod || "").toLowerCase();

      const isPendingPayment =
        paymentStatus === "pending" && paymentMethod !== "cod";
      if (
        isPendingPayment ||
        paymentStatus === "failed" ||
        orderStatus === "cancelled"
      ) {
        return false;
      }
      return orderStatus !== "delivered";
    });
  }, [orders]);

  // ── 2. HISTORY / DELIVERED ORDERS ──
  const historyOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const orderStatus = (o.orderStatus || o.status || "").toLowerCase();
      const paymentStatus = (o.paymentStatus || "").toLowerCase();
      const paymentMethod = (o.paymentMethod || "").toLowerCase();

      const isPendingPayment =
        paymentStatus === "pending" && paymentMethod !== "cod";
      if (isPendingPayment || paymentStatus === "failed") {
        return false;
      }
      return orderStatus === "delivered";
    });
  }, [orders]);

  // ── 3. PENDING PAYMENT ORDERS (Unfinished online checkouts / failed) ──
  const pendingOrders = useMemo(() => {
    return (orders || []).filter((o) => {
      const orderStatus = (o.orderStatus || o.status || "").toLowerCase();
      const paymentStatus = (o.paymentStatus || "").toLowerCase();
      const paymentMethod = (o.paymentMethod || "").toLowerCase();

      const isPendingPayment =
        paymentStatus === "pending" && paymentMethod !== "cod";
      return (
        isPendingPayment ||
        paymentStatus === "failed" ||
        orderStatus === "cancelled"
      );
    });
  }, [orders]);

  // Get current tab list
  const currentList = useMemo(() => {
    switch (activeTab) {
      case "active":
        return activeOrders;
      case "history":
        return historyOrders;
      case "pending":
        return pendingOrders;
      default:
        return activeOrders;
    }
  }, [activeTab, activeOrders, historyOrders, pendingOrders]);

  // Loading Screen
  if (loading && (!orders || orders.length === 0)) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="My Orders"
        scroll={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingWrap}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={FNP_COLORS.primary} />
            <Text style={styles.loadingText}>Loading your orders...</Text>
            <Text style={styles.loadingSubtext}>
              Fetching your orders and delivery statuses
            </Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Not Authenticated
  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="My Orders"
        scroll={false}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <LinearGradient
              colors={["#FFEBEE", "#FFCDD2"]}
              style={styles.emptyGradient}
            >
              <Ionicons name="person-outline" size={54} color="#C62828" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyMessage}>
            Please sign in to view your orders, payment history, and track deliveries.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[FNP_COLORS.primary, FNP_COLORS.primaryDark]}
              style={styles.emptyBtnGradient}
            >
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
              <Text style={styles.emptyBtnText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Segmented Tabs Header
  const renderTabsHeader = () => (
    <View style={styles.tabsHeaderWrap}>
      <View style={styles.tabsContainer}>
        {/* Tab 1: Active */}
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "active" && styles.tabBtnActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("active");
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="cube-outline"
            size={15}
            color={activeTab === "active" ? FNP_COLORS.primary : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
          {activeOrders.length > 0 && (
            <View
              style={[
                styles.tabBadge,
                activeTab === "active" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "active" && styles.tabBadgeTextActive,
                ]}
              >
                {activeOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tab 2: History (Delivered) */}
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "history" && styles.tabBtnActive,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("history");
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={15}
            color={activeTab === "history" ? FNP_COLORS.primary : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.tabTextActive,
            ]}
          >
            History
          </Text>
          {historyOrders.length > 0 && (
            <View
              style={[
                styles.tabBadge,
                activeTab === "history" && styles.tabBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "history" && styles.tabBadgeTextActive,
                ]}
              >
                {historyOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tab 3: Pending Payment */}
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === "pending" && styles.tabBtnActivePending,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab("pending");
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="alert-circle-outline"
            size={15}
            color={activeTab === "pending" ? "#D97706" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.tabTextActivePending,
            ]}
          >
            Pending
          </Text>
          {pendingOrders.length > 0 && (
            <View
              style={[
                styles.tabBadgePending,
                activeTab === "pending" && styles.tabBadgePendingActive,
              ]}
            >
              <Text
                style={[
                  styles.tabBadgeTextPending,
                  activeTab === "pending" && styles.tabBadgeTextPendingActive,
                ]}
              >
                {pendingOrders.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="My Orders"
      scroll={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Tabs Row */}
      {renderTabsHeader()}

      {/* Order List */}
      <FlatList
        data={currentList}
        keyExtractor={(item) =>
          item.id || item._id || Math.random().toString()
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={handleOrderPress}
            tabKey={activeTab}
          />
        )}
        contentContainerStyle={styles.orderList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[FNP_COLORS.primary]}
            tintColor={FNP_COLORS.primary}
          />
        }
        ListEmptyComponent={
          <TabEmptyState tabKey={activeTab} navigation={navigation} />
        }
      />
    </ScreenContainer>
  );
}

export default MyOrdersScreen;

const styles = StyleSheet.create({
  // ── Tabs Header ──
  tabsHeaderWrap: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#F4F6F4",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    ...shadows.small,
  },
  tabBtnActivePending: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
    ...shadows.small,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
  },
  tabTextActive: {
    color: FNP_COLORS.primary,
    fontWeight: "700",
  },
  tabTextActivePending: {
    color: "#D97706",
    fontWeight: "700",
  },
  tabBadge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: FNP_COLORS.primaryLight,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  tabBadgeTextActive: {
    color: FNP_COLORS.primaryDark,
  },
  tabBadgePending: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgePendingActive: {
    backgroundColor: "#FEF3C7",
  },
  tabBadgeTextPending: {
    fontSize: 10,
    fontWeight: "700",
    color: "#DC2626",
  },
  tabBadgeTextPendingActive: {
    color: "#D97706",
  },

  // ── List ──
  orderList: {
    paddingHorizontal: spacing.screen,
    paddingTop: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },

  // ── Order Card ──
  orderCardWrapper: {
    marginBottom: 14,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    ...shadows.small,
  },
  orderCardPending: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFEFA",
  },

  // ── Order Header ──
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    fontSize: 14,
    fontWeight: "800",
    color: FNP_COLORS.text,
  },

  // ── Status Badge ──
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Pending Alert Banner ──
  pendingAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  pendingAlertText: {
    flex: 1,
    fontSize: 11,
    color: "#92400E",
    fontWeight: "500",
    lineHeight: 15,
  },

  // ── Date & Meta ──
  orderMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
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

  // ── Order Items ──
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

  // ── Order Footer ──
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
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
    fontSize: 17,
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
  payNowBadgeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  payNowBadgeBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  // ── Progress Bar ──
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

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 36,
    paddingTop: 48,
  },
  emptyIconWrap: {
    marginBottom: 20,
  },
  emptyGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    ...typography.h2,
    color: FNP_COLORS.text,
    fontSize: 20,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyMessage: {
    ...typography.body,
    color: FNP_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    fontSize: 13,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyBtn: {
    borderRadius: 14,
    overflow: "hidden",
    ...shadows.medium,
  },
  emptyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Loading ──
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 36,
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
    ...shadows.medium,
  },
  loadingText: {
    ...typography.body,
    fontWeight: "700",
    color: FNP_COLORS.text,
    marginTop: 16,
  },
  loadingSubtext: {
    ...typography.bodySmall,
    color: FNP_COLORS.textLight,
    fontWeight: "500",
    marginTop: 6,
    textAlign: "center",
  },
});
