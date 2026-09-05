import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { formatPrice } from "../utils/helpers";
import { spacing, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchMyOrders, fetchOrderById } from "../store/thunks/orderThunks";
import {
  selectCurrentOrder,
  selectOrders,
  selectOrdersLoading,
  selectOrdersError,
} from "../store/slices/ordersSlice";

const fnpColors = {
  primary: "#E91E63",
  primaryLight: "#FCE4EC",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textMuted: "#999999",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#F44336",
  cream: "#FFF8F0",
};

const STATUS_STEPS = ["placed", "processing", "shipped", "delivered"];

function getStatusStep(status) {
  const index = STATUS_STEPS.indexOf(status);
  return index >= 0 ? index : 0;
}

function formatStatusLabel(status) {
  if (!status) return "Pending";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TrackOrderScreen({ route }) {
  const { orderId } = route.params ?? {};
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const order = useAppSelector(selectCurrentOrder);
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (orderId) {
      dispatch(fetchOrderById(orderId));
    }
    else if (orders.length === 0) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isAuthenticated, orderId, orders.length]);

  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Track Order"
      >
        <View style={styles.centered}>
          <Ionicons name="person-outline" size={64} color={fnpColors.textMuted} />
          <Text style={styles.title}>Sign in required</Text>
          <Text style={styles.subtitle}>
            Sign in to view your order tracking details.
          </Text>
          <Button
            title="Sign In"
            onPress={() => navigation.navigate("Login")}
            style={styles.actionButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (!orderId) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Track Order"
      >
        <ScrollView contentContainerStyle={styles.listContent}>
          <Text style={styles.title}>Select an order to track</Text>
          <Text style={styles.subtitle}>
            Public order lookup is not available. Choose one of your orders below.
          </Text>
          {loading && orders.length === 0 ? (
            <ActivityIndicator size="large" color={fnpColors.primary} style={styles.loader} />
          ) : null}
          {orders.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.orderPickCard}
              onPress={() => navigation.navigate("TrackOrder", { orderId: item._id })}
            >
              <View>
                <Text style={styles.orderPickNumber}>
                  {item.easebuzzOrderId || item._id}
                </Text>
                <Text style={styles.orderPickMeta}>
                  {formatStatusLabel(item.orderStatus || item.status)}
                  {" • "}
                  {formatPrice(item.finalAmount ?? item.totalAmount ?? 0)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={fnpColors.textMuted} />
            </TouchableOpacity>
          ))}
          <Button
            title="View All Orders"
            onPress={() => navigation.navigate("Main", { screen: "Orders" })}
            style={styles.actionButton}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (loading && (!order || order._id !== orderId)) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Track Order"
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={fnpColors.primary} />
          <Text style={styles.subtitle}>Loading order details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error && (!order || order._id !== orderId)) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Track Order"
      >
        <View style={styles.centered}>
          <Text style={styles.title}>Unable to load order</Text>
          <Text style={styles.subtitle}>{error}</Text>
          <Button
            title="Back to Orders"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  const displayOrder = order?._id === orderId ? order : null;
  if (!displayOrder) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Track Order"
      >
        <View style={styles.centered}>
          <Text style={styles.title}>Order not found</Text>
          <Button
            title="Back to Orders"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  const currentStatus = displayOrder.orderStatus || displayOrder.status || "placed";
  const currentStep = getStatusStep(currentStatus);
  const shipping = displayOrder.shippingDetails || {};
  const history = displayOrder.statusHistory || [];

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="Track Order"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIconWrap}>
              <Ionicons name="cube-outline" size={28} color={fnpColors.primary} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{formatStatusLabel(currentStatus)}</Text>
              <Text style={styles.orderNumber}>
                {displayOrder.easebuzzOrderId || displayOrder._id}
              </Text>
              <Text style={styles.paymentMeta}>
                Payment: {displayOrder.paymentStatus || "pending"}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Order Date</Text>
              <Text style={styles.infoValue}>
                {displayOrder.createdAt
                  ? new Date(displayOrder.createdAt).toLocaleDateString("en-IN")
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>
                {formatPrice(displayOrder.finalAmount ?? displayOrder.totalAmount ?? 0)}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Items</Text>
              <Text style={styles.infoValue}>{displayOrder.items?.length || 0}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Courier</Text>
              <Text style={styles.infoValue}>{shipping.courierName || "N/A"}</Text>
            </View>
          </View>

          {shipping.trackingNumber ? (
            <View style={styles.trackingBox}>
              <Text style={styles.trackingLabel}>Tracking Number</Text>
              <Text style={styles.trackingValue}>{shipping.trackingNumber}</Text>
              {shipping.trackingUrl ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(shipping.trackingUrl)}
                  style={styles.trackingLink}
                >
                  <Text style={styles.trackingLinkText}>Open tracking link</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Delivery Timeline</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStep && currentStatus !== "cancelled";
              const isActive = index === currentStep && currentStatus !== "cancelled";
              return (
                <View key={step} style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isActive && styles.timelineDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.timelineText,
                      isCompleted && styles.timelineTextCompleted,
                    ]}
                  >
                    {formatStatusLabel(step)}
                  </Text>
                </View>
              );
            })}
          </View>

          {history.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Status History</Text>
              {history.map((entry, index) => (
                <View key={`${entry.status}-${index}`} style={styles.historyRow}>
                  <Text style={styles.historyStatus}>{formatStatusLabel(entry.status)}</Text>
                  <Text style={styles.historyNote}>{entry.note || ""}</Text>
                  <Text style={styles.historyDate}>
                    {entry.timestamp
                      ? new Date(entry.timestamp).toLocaleString("en-IN")
                      : ""}
                  </Text>
                </View>
              ))}
            </>
          ) : null}

          {displayOrder.shippingAddress ? (
            <>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <View style={styles.addressBox}>
                <Text style={styles.addressText}>
                  {displayOrder.shippingAddress.fullName}
                  {"\n"}
                  {displayOrder.shippingAddress.streetAddress}
                  {displayOrder.shippingAddress.landmark
                    ? `\n${displayOrder.shippingAddress.landmark}`
                    : ""}
                  {"\n"}
                  {displayOrder.shippingAddress.city}, {displayOrder.shippingAddress.state}
                  {" "}
                  {displayOrder.shippingAddress.pincode}
                  {"\n"}
                  {displayOrder.shippingAddress.phone}
                </Text>
              </View>
            </>
          ) : null}

          {displayOrder.items?.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {displayOrder.items.map((item, index) => (
                <View key={`${item.productId || index}-${item.colorIndex}`} style={styles.itemRow}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemThumb} contentFit="cover" />
                  ) : (
                    <View style={styles.itemThumbPlaceholder}>
                      <Ionicons name="image-outline" size={18} color={fnpColors.textMuted} />
                    </View>
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      Qty {item.quantity}
                      {item.colorName ? ` • ${item.colorName}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>{formatPrice(item.price || 0)}</Text>
                </View>
              ))}
            </>
          ) : null}

          <TouchableOpacity
            style={styles.supportBtn}
            onPress={() => navigation.navigate("Contact")}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={18} color={fnpColors.primary} />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: spacing.screen,
    paddingBottom: 24,
  },
  listContent: {
    padding: spacing.screen,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loader: {
    marginTop: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 12,
    minWidth: 180,
  },
  orderPickCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: fnpColors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    ...shadows.small,
  },
  orderPickNumber: {
    fontSize: 15,
    fontWeight: "700",
    color: fnpColors.text,
  },
  orderPickMeta: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: fnpColors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    ...shadows.medium,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: fnpColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
  },
  orderNumber: {
    fontSize: 13,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  paymentMeta: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginTop: 4,
    textTransform: "capitalize",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  infoCard: {
    width: "48%",
    backgroundColor: fnpColors.cream,
    borderRadius: 12,
    padding: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: fnpColors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: fnpColors.text,
    marginTop: 4,
  },
  trackingBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  trackingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.text,
    marginTop: 4,
  },
  trackingLink: {
    marginTop: 8,
  },
  trackingLinkText: {
    color: fnpColors.primary,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  timeline: {
    gap: 10,
    marginBottom: 8,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: fnpColors.borderLight,
  },
  timelineDotCompleted: {
    backgroundColor: fnpColors.primary,
  },
  timelineDotActive: {
    backgroundColor: fnpColors.primary,
    transform: [{ scale: 1.2 }],
  },
  timelineText: {
    fontSize: 14,
    color: fnpColors.textMuted,
  },
  timelineTextCompleted: {
    color: fnpColors.text,
    fontWeight: "600",
  },
  historyRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: fnpColors.borderLight,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: fnpColors.text,
  },
  historyNote: {
    fontSize: 13,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  addressBox: {
    backgroundColor: fnpColors.cream,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: fnpColors.text,
    lineHeight: 20,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  itemThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: fnpColors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: fnpColors.primary,
  },
  supportBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fnpColors.primary,
  },
  supportBtnText: {
    color: fnpColors.primary,
    fontWeight: "600",
  },
});
