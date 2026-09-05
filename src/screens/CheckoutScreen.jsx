import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import {
  formatPrice,
} from "../utils/helpers";
import { buildShippingAddressFromForm } from "../utils/orderNormalize";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCartItems,
  selectCartTotalAmount,
} from "../store/slices/cartSlice";
import { fetchCart } from "../store/thunks/cartThunks";
import { createOrder } from "../store/slices/ordersSlice";

const { width } = Dimensions.get("window");

// FNP Brand Colors
const fnpColors = {
  primary: "#E91E63",
  primaryLight: "#FCE4EC",
  primaryDark: "#C2185B",
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

export function CheckoutScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotalAmount);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);
  const progressValue = useSharedValue(0);
  // const navigation = useNavigation();

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withSpring(1);
    progressValue.value = withSpring(0.6);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated, navigation]);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const payableTotal = cartTotal;

  // Validate form
  useEffect(() => {
    const isValid =
      form.fullName.trim().length > 0 &&
      form.email.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.addressLine1.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.pinCode.trim().length > 0 &&
      form.state.trim().length > 0;
    setIsFormValid(isValid);
  }, [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields to complete your order.",
        [{ text: "OK" }],
      );
      return;
    }

    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty. Add items before checkout.");
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = buildShippingAddressFromForm(form);
      const result = await dispatch(
        createOrder({
          shippingAddress,
          couponCode: couponCode.trim() || undefined,
        }),
      ).unwrap();

      if (result.razorpayOrderId) {
        navigation.navigate("RazorpayPayment", {
          orderId: result.order?._id,
          razorpayOrderId: result.razorpayOrderId,
          amount: result.amount,
          currency: result.currency || "INR",
          keyId: result.keyId,
          customerName: form.fullName,
          customerEmail: form.email,
          customerPhone: form.phone,
        });
        return;
      }

      if (result.paymentData && result.easebuzzUrl) {
        navigation.navigate("EasebuzzPayment", {
          paymentData: result.paymentData,
          easebuzzUrl: result.easebuzzUrl,
          orderId: result.order?._id,
        });
        return;
      }

      throw new Error(result.message || "Payment could not be initiated. Please try again.");
    }
    catch (error) {
      const message = typeof error === "string"
        ? error
        : error?.message || "Failed to create order. Please try again.";
      Alert.alert("Checkout Error", message, [{ text: "OK" }]);
    }
    finally {
      setLoading(false);
    }
  };

  // If cart is empty, redirect
  if (cartItems.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Checkout"
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={fnpColors.textMuted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some items to proceed with checkout
          </Text>
          <Button
            title="Start Shopping"
            onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
            style={styles.emptyBtn}
          />
        </View>
      </ScreenContainer>
    );
  }
  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Checkout"
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={fnpColors.textMuted} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to complete checkout
          </Text>
          <Button
            title="Sign In"
            onPress={() => navigation.navigate("Login")}
            style={styles.emptyBtn}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Checkout"
        scroll={false}
        headerRight={
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Help",
                "Need help with your order? Contact our support team.",
              )
            }
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={fnpColors.text}
            />
          </TouchableOpacity>
        }
      >
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          style={styles.scrollView}
        >
          {/* ===== PROGRESS INDICATOR ===== */}
          <Animated.View
            style={[styles.progressContainer, animatedHeaderStyle]}
          >
            <View style={styles.progressSteps}>
              <View style={styles.progressStep}>
                <View style={styles.progressStepCircle}>
                  <Text style={styles.progressStepNumber}>1</Text>
                </View>
                <Text style={styles.progressStepLabel}>Address</Text>
              </View>
              <View style={styles.progressLine} />
              <View style={styles.progressStep}>
                <View
                  style={[
                    styles.progressStepCircle,
                    styles.progressStepCircleActive,
                  ]}
                >
                  <Text style={styles.progressStepNumberActive}>2</Text>
                </View>
                <Text style={styles.progressStepLabelActive}>Payment</Text>
              </View>
              <View style={styles.progressLine} />
              <View style={styles.progressStep}>
                <View style={styles.progressStepCircle}>
                  <Text style={styles.progressStepNumber}>3</Text>
                </View>
                <Text style={styles.progressStepLabel}>Confirm</Text>
              </View>
            </View>
          </Animated.View>

          {/* ===== SHIPPING ADDRESS SECTION ===== */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={fnpColors.primary}
                />
                <Text style={styles.sectionTitle}>Shipping Address</Text>
              </View>
              <View style={styles.requiredBadge}>
                <Text style={styles.requiredBadgeText}>Required</Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Full Name"
                value={form.fullName}
                onChangeText={(v) => updateField("fullName", v)}
                required
                icon="person-outline"
                placeholder="Enter your full name"
                containerStyle={styles.inputContainer}
              />

              <View style={styles.row}>
                <Input
                  label="Email Address"
                  value={form.email}
                  onChangeText={(v) => updateField("email", v)}
                  required
                  keyboardType="email-address"
                  icon="mail-outline"
                  placeholder="your@email.com"
                  containerStyle={[styles.halfInput, styles.inputContainer]}
                />
                <Input
                  label="Phone Number"
                  value={form.phone}
                  onChangeText={(v) => updateField("phone", v)}
                  required
                  keyboardType="phone-pad"
                  icon="call-outline"
                  placeholder="+91-98765-43210"
                  containerStyle={[styles.halfInput, styles.inputContainer]}
                />
              </View>

              <Input
                label="Address Line 1"
                value={form.addressLine1}
                onChangeText={(v) => updateField("addressLine1", v)}
                required
                icon="location-outline"
                placeholder="Street address, building, flat no."
                containerStyle={styles.inputContainer}
              />

              <Input
                label="Address Line 2 (Optional)"
                value={form.addressLine2}
                onChangeText={(v) => updateField("addressLine2", v)}
                icon="location-outline"
                placeholder="Landmark, area, etc."
                containerStyle={styles.inputContainer}
              />

              <View style={styles.row}>
                <Input
                  label="City"
                  value={form.city}
                  onChangeText={(v) => updateField("city", v)}
                  required
                  icon="business-outline"
                  placeholder="Your city"
                  containerStyle={[styles.halfInput, styles.inputContainer]}
                />
                <Input
                  label="Pin Code"
                  value={form.pinCode}
                  onChangeText={(v) => updateField("pinCode", v)}
                  required
                  keyboardType="number-pad"
                  icon="location-outline"
                  placeholder="6 digit code"
                  containerStyle={[styles.halfInput, styles.inputContainer]}
                />
              </View>

              <Input
                label="State"
                value={form.state}
                onChangeText={(v) => updateField("state", v)}
                required
                icon="business-outline"
                placeholder="Your state"
                containerStyle={styles.inputContainer}
              />
            </View>
          </Animated.View>

          {/* ===== PAYMENT SECTION ===== */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons
                  name="card-outline"
                  size={22}
                  color={fnpColors.primary}
                />
                <Text style={styles.sectionTitle}>Payment</Text>
              </View>
            </View>

            <View style={styles.paymentMethodsContainer}>
              <View style={[styles.paymentMethod, styles.paymentMethodSelected]}>
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentIcon, styles.paymentIconSelected]}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={fnpColors.primary}
                    />
                  </View>
                  <View style={styles.paymentMethodDetails}>
                    <Text style={[styles.paymentMethodLabel, styles.paymentMethodLabelSelected]}>
                      Razorpay Secure Checkout
                    </Text>
                    <Text style={styles.paymentMethodSubLabel}>
                      UPI (GPay, PhonePe, Paytm), Cards & NetBanking
                    </Text>
                  </View>
                </View>
                <View style={[styles.paymentRadio, styles.paymentRadioSelected]}>
                  <View style={styles.paymentRadioInner} />
                </View>
              </View>
            </View>

            <View style={styles.formContainer}>
              <Input
                label="Coupon Code (Optional)"
                value={couponCode}
                onChangeText={setCouponCode}
                icon="pricetag-outline"
                placeholder="Enter coupon code"
                autoCapitalize="characters"
                containerStyle={styles.inputContainer}
              />
            </View>

            <View style={styles.secureNote}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={fnpColors.success}
              />
              <Text style={styles.secureNoteText}>
                Payment is processed securely. Your cart is cleared only after successful payment.
              </Text>
            </View>
          </Animated.View>

          {/* ===== ORDER SUMMARY SECTION ===== */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Ionicons
                  name="receipt-outline"
                  size={22}
                  color={fnpColors.primary}
                />
                <Text style={styles.sectionTitle}>Order Summary</Text>
              </View>
              <Text style={styles.itemCountText}>{itemCount} items</Text>
            </View>

            {cartItems.map((item) => (
              <View key={item.lineKey} style={styles.cartItemRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.cartItemThumb} contentFit="cover" />
                ) : (
                  <View style={styles.cartItemThumbPlaceholder}>
                    <Ionicons name="image-outline" size={18} color={fnpColors.textMuted} />
                  </View>
                )}
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product?.name || "Product"}
                  </Text>
                  <Text style={styles.cartItemMeta}>
                    Qty {item.quantity}
                    {item.colorName ? ` • ${item.colorName}` : ""}
                  </Text>
                </View>
                <Text style={styles.cartItemPrice}>
                  {formatPrice((item.price || 0) * item.quantity)}
                </Text>
              </View>
            ))}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <View>
                <Text style={styles.totalLabel}>Payable Amount</Text>
                <Text style={styles.totalSubLabel}>Final amount confirmed at payment</Text>
              </View>
              <Text style={styles.totalValue}>{formatPrice(payableTotal)}</Text>
            </View>

            {/* Eco-Friendly Note */}
            <View style={styles.ecoNote}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.ecoNoteGradient}
              >
                <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
                <Text style={styles.ecoNoteText}>
                  🌱 One tree will be planted for this order
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* ===== ORDER ITEMS PREVIEW ===== */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(400)}
            style={styles.section}
          >
            <TouchableOpacity
              style={styles.itemsPreview}
              onPress={() => navigation.navigate("Cart")}
              activeOpacity={0.7}
            >
              <View style={styles.itemsPreviewLeft}>
                <Ionicons
                  name="bag-outline"
                  size={20}
                  color={fnpColors.primary}
                />
                <Text style={styles.itemsPreviewText}>
                  View {itemCount} items in your cart
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={fnpColors.textMuted}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Spacer for bottom button */}
          <View style={styles.bottomSpacer} />
        </Animated.ScrollView>

        {/* ===== PLACE ORDER BUTTON ===== */}
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={styles.bottomContainer}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "#FFFFFF"]}
            style={styles.bottomGradient}
          >
            <View style={styles.bottomContent}>
              <View style={styles.bottomPrice}>
                <Text style={styles.bottomTotalLabel}>Total</Text>
                <Text style={styles.bottomTotalValue}>
                  {formatPrice(payableTotal)}
                </Text>
              </View>
              <Button
                title={loading ? "Creating order..." : "Proceed to Payment"}
                onPress={handlePlaceOrder}
                loading={loading}
                disabled={!isFormValid || loading}
                style={[
                  styles.placeBtn,
                  (!isFormValid || loading) && styles.placeBtnDisabled,
                ]}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== PROGRESS =====
  progressContainer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  progressSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressStep: {
    alignItems: "center",
  },
  progressStepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: fnpColors.borderLight,
  },
  progressStepCircleActive: {
    backgroundColor: fnpColors.primary,
    borderColor: fnpColors.primary,
  },
  progressStepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: fnpColors.textMuted,
  },
  progressStepNumberActive: {
    fontSize: 12,
    fontWeight: "600",
    color: fnpColors.white,
  },
  progressStepLabel: {
    fontSize: 10,
    color: fnpColors.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },
  progressStepLabelActive: {
    fontSize: 10,
    color: fnpColors.primary,
    marginTop: 4,
    fontWeight: "600",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: fnpColors.borderLight,
    marginHorizontal: 8,
  },

  // ===== SECTIONS =====
  section: {
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: fnpColors.text,
    fontSize: 16,
  },
  requiredBadge: {
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  requiredBadgeText: {
    fontSize: 9,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },

  // ===== PAYMENT =====
  paymentMethodsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  paymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.buttonRadius,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    backgroundColor: fnpColors.white,
  },
  paymentMethodSelected: {
    borderColor: fnpColors.primary,
    backgroundColor: fnpColors.primaryLight,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIconSelected: {
    backgroundColor: fnpColors.primaryLight,
  },
  paymentMethodLabel: {
    ...typography.body,
    color: fnpColors.text,
    fontWeight: "500",
  },
  paymentMethodLabelSelected: {
    color: fnpColors.primary,
    fontWeight: "600",
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodSubLabel: {
    ...typography.caption,
    color: fnpColors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  paymentRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: fnpColors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentRadioSelected: {
    borderColor: fnpColors.primary,
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: fnpColors.primary,
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  secureNoteText: {
    ...typography.caption,
    color: fnpColors.textMuted,
    flex: 1,
  },

  // ===== SUMMARY =====
  itemCountText: {
    ...typography.bodySmall,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  summaryLabel: {
    ...typography.body,
    color: fnpColors.textMuted,
  },
  summaryValue: {
    ...typography.body,
    color: fnpColors.text,
    fontWeight: "500",
  },
  freeShippingText: {
    color: fnpColors.success,
    fontWeight: "700",
  },
  shippingNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  shippingNoteText: {
    ...typography.caption,
    color: fnpColors.warning,
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: fnpColors.borderLight,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: fnpColors.text,
    fontSize: 16,
  },
  totalSubLabel: {
    ...typography.caption,
    color: fnpColors.textMuted,
    fontSize: 11,
  },
  totalValue: {
    ...typography.h2,
    color: fnpColors.primary,
    fontSize: 22,
  },

  // ===== ECO NOTE =====
  ecoNote: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  ecoNoteGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.buttonRadius,
    justifyContent: "center",
  },
  ecoNoteText: {
    ...typography.bodySmall,
    color: "#2E7D32",
    fontWeight: "600",
  },

  // ===== ITEMS PREVIEW =====
  itemsPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  itemsPreviewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemsPreviewText: {
    ...typography.body,
    color: fnpColors.text,
    fontWeight: "500",
  },

  // ===== BOTTOM =====
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    ...shadows.medium,
  },
  bottomContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.screen,
    paddingBottom: Platform.OS === "ios" ? 34 : spacing.lg,
  },
  bottomPrice: {
    flex: 1,
  },
  bottomTotalLabel: {
    ...typography.caption,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  bottomTotalValue: {
    ...typography.h2,
    color: fnpColors.primary,
    fontSize: 22,
  },
  placeBtn: {
    flex: 1,
    marginLeft: spacing.md,
    borderRadius: 16,
    backgroundColor: fnpColors.primary,
  },
  placeBtnDisabled: {
    backgroundColor: fnpColors.textMuted,
    opacity: 0.6,
  },

  // ===== EMPTY =====
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...typography.h2,
    color: fnpColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    ...typography.body,
    color: fnpColors.textMuted,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  emptyBtn: {
    paddingHorizontal: 40,
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 80,
  },

  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  cartItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  cartItemThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    ...typography.body,
    fontWeight: "600",
    color: fnpColors.text,
  },
  cartItemMeta: {
    ...typography.caption,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  cartItemPrice: {
    ...typography.body,
    fontWeight: "700",
    color: fnpColors.primary,
  },
});
