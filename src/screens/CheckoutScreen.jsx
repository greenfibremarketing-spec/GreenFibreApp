import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import { CustomAlert } from "../components/common/CustomAlert";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { DrawerActions } from "@react-navigation/native";
import { formatPrice } from "../utils/helpers";
import { buildShippingAddressFromForm } from "../utils/orderNormalize";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCartItems,
  selectCartTotalAmount,
} from "../store/slices/cartSlice";
import { fetchCart } from "../store/thunks/cartThunks";
import { razorpayService } from "../api/services/razorpayService";
import { resolveImageUrl } from "../utils/catalogNormalize";

const { width } = Dimensions.get("window");

// FNP & Green Fibre Brand Colors
const fnpColors = {
  primary: "#1C4A2A",
  primaryMedium: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#13351E",
  gold: "#D4AF37",
  goldLight: "#FFF9E6",
  goldDark: "#997A15",
  white: "#FFFFFF",
  cream: "#FAF7F2",
  creamDark: "#EDE8DF",
  text: "#1A1A1A",
  textSecondary: "#555555",
  textMuted: "#888888",
  borderLight: "#E5E5E5",
  borderFocus: "#1C4A2A",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  danger: "#D32F2F",
  warning: "#E65100",
  warningLight: "#FFF3E0",
  cardBg: "#FFFFFF",
};

const ADDRESS_TYPES = [
  { id: "Home", label: "Home", icon: "home-outline", sub: "7 AM - 9 PM" },
  { id: "Work", label: "Work / Office", icon: "briefcase-outline", sub: "9 AM - 6 PM" },
  { id: "Other", label: "Other", icon: "location-outline", sub: "Standard" },
];

const DELIVERY_INSTRUCTIONS = [
  "Leave at door / security",
  "Call before delivery",
  "Do not ring bell",
  "Handle plants with care",
];

export function CheckoutScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotal = useAppSelector(selectCartTotalAmount);
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const initialCoupon = route?.params?.couponCode || "";
  const initialDiscount = route?.params?.discountAmount || 0;

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [discountAmount, setDiscountAmount] = useState(initialDiscount);
  const [isFormValid, setIsFormValid] = useState(false);

  // Detailed shipping address state
  const [form, setForm] = useState({
    fullName: user?.name || user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    pinCode: "",
    houseNo: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    addressType: "Home",
    deliveryInstructions: "",
  });

  // Pincode lookup state
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null); // { verified: boolean, message: string, city?: string, state?: string }

  // Animations
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withSpring(1);
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
  const payableTotal = Math.max(0, cartTotal - (discountAmount || 0));

  // Validate form fields
  useEffect(() => {
    const cleanPhone = String(form.phone || "").replace(/\D/g, "");
    const cleanPin = String(form.pinCode || "").replace(/\D/g, "");

    const isValid =
      form.fullName.trim().length >= 2 &&
      form.email.trim().includes("@") &&
      cleanPhone.length >= 10 &&
      cleanPin.length === 6 &&
      form.houseNo.trim().length >= 2 &&
      form.street.trim().length >= 2 &&
      form.city.trim().length >= 2 &&
      form.state.trim().length >= 2;

    setIsFormValid(isValid);
  }, [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Indian Pincode Auto-Detection via Postal Registry
  const handlePincodeChange = async (val) => {
    const cleanPin = val.replace(/\D/g, "").slice(0, 6);
    updateField("pinCode", cleanPin);

    if (cleanPin.length === 6) {
      setPincodeLoading(true);
      setPincodeStatus(null);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
        const data = await res.json();
        if (
          Array.isArray(data) &&
          data[0]?.Status === "Success" &&
          Array.isArray(data[0].PostOffice) &&
          data[0].PostOffice.length > 0
        ) {
          const po = data[0].PostOffice[0];
          const detectedCity = po.District || po.Name || "";
          const detectedState = po.State || "";

          setForm((prev) => ({
            ...prev,
            pinCode: cleanPin,
            city: prev.city ? prev.city : detectedCity,
            state: prev.state ? prev.state : detectedState,
          }));

          setPincodeStatus({
            verified: true,
            city: detectedCity,
            state: detectedState,
            message: `Delivery available for ${detectedCity}, ${detectedState} • Express Eco-Dispatch`,
          });
        } else {
          setPincodeStatus({
            verified: false,
            message: "PIN code verified. Please confirm your City and State below.",
          });
        }
      } catch (err) {
        if (__DEV__) {
          console.log("PIN code lookup fallback:", err);
        }
        setPincodeStatus({
          verified: false,
          message: "Could not auto-verify PIN code. Please confirm City and State manually.",
        });
      } finally {
        setPincodeLoading(false);
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const getMissingFields = () => {
    const missing = [];
    if (!form.fullName.trim()) missing.push("Full Name");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) missing.push("10-digit Phone Number");
    if (!form.email.trim() || !form.email.includes("@")) missing.push("Valid Email");
    if (!form.pinCode.trim() || form.pinCode.replace(/\D/g, "").length !== 6) missing.push("6-digit PIN Code");
    if (!form.houseNo.trim()) missing.push("Flat / House / Building No.");
    if (!form.street.trim()) missing.push("Street / Road / Area");
    if (!form.city.trim()) missing.push("City");
    if (!form.state.trim()) missing.push("State");
    return missing;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      const missing = getMissingFields();
      CustomAlert.alert(
        "Complete Delivery Address",
        `Please fill in the following required field(s) for guaranteed delivery:\n\n• ${missing.join("\n• ")}`,
        [{ text: "Complete Now" }]
      );
      return;
    }

    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }

    if (cartItems.length === 0) {
      CustomAlert.alert("Empty Cart", "Your cart is empty. Add items before checkout.");
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = buildShippingAddressFromForm(form);
      const amountInPaise = Math.round(Number(payableTotal) * 100);

      // 1. Create Razorpay order on backend
      const result = await razorpayService.createOrder({
        amount: amountInPaise,
        currency: "INR",
        shippingAddress,
        couponCode: couponCode.trim() || undefined,
        notes: {
          customerName: form.fullName,
          customerPhone: form.phone,
          customerEmail: form.email,
          addressType: form.addressType,
          deliveryInstructions: form.deliveryInstructions || undefined,
        },
      });

      if (!result.order_id) {
        throw new Error("Could not initialize Razorpay order. Please try again.");
      }

      // 2. Open In-App Razorpay Payment Screen
      navigation.navigate("RazorpayPayment", {
        razorpayOrderId: result.order_id,
        amount: result.amount,
        currency: result.currency,
        keyId: result.key_id,
        orderId: result.orderId,
        customerInfo: {
          name: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        notes: {
          orderId: result.orderId,
        },
      });
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.message || "Failed to create order. Please try again.";
      CustomAlert.alert("Checkout Error", message, [{ text: "OK" }]);
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, redirect
  if (cartItems.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="Checkout"
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={fnpColors.textMuted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add some sustainable items to proceed with checkout
          </Text>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionBtnText}>Explore Shop</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="Checkout"
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="person-outline" size={64} color={fnpColors.textMuted} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySubtitle}>
            Please sign in to complete your purchase and track delivery
          </Text>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="Checkout & Shipping"
      scroll={false}
      headerRight={
        <TouchableOpacity
          onPress={() =>
            CustomAlert.alert(
              "Guaranteed Delivery Support",
              "Green Fibre guarantees 100% safe, eco-packaged delivery. Need help with address or pincode? Reach us at support@greenfibre.org"
            )
          }
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={fnpColors.primary} />
        </TouchableOpacity>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== STEP PROGRESS INDICATOR ===== */}
        <Animated.View style={[styles.progressContainer, animatedHeaderStyle]}>
          <View style={styles.progressSteps}>
            <View style={styles.progressStep}>
              <View style={[styles.progressStepCircle, styles.progressStepCircleActive]}>
                <Ionicons name="location" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.progressStepLabelActive}>Address</Text>
            </View>
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressStepCircle, styles.progressStepCircleActive]}>
                <Text style={styles.progressStepNumberActive}>2</Text>
              </View>
              <Text style={styles.progressStepLabelActive}>Payment</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={styles.progressStepCircle}>
                <Text style={styles.progressStepNumber}>3</Text>
              </View>
              <Text style={styles.progressStepLabel}>Delivered</Text>
            </View>
          </View>
        </Animated.View>

        {/* ===== TRUST ASSURANCE BANNER ===== */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.assuranceBanner}>
          <View style={styles.assuranceItem}>
            <Ionicons name="shield-checkmark" size={16} color="#2E7D32" />
            <Text style={styles.assuranceText}>100% Safe Delivery</Text>
          </View>
          <View style={styles.assuranceDivider} />
          <View style={styles.assuranceItem}>
            <Ionicons name="leaf" size={16} color="#2E7D32" />
            <Text style={styles.assuranceText}>Eco-Packaging</Text>
          </View>
          <View style={styles.assuranceDivider} />
          <View style={styles.assuranceItem}>
            <Ionicons name="flash" size={16} color="#2E7D32" />
            <Text style={styles.assuranceText}>Free Shipping</Text>
          </View>
        </Animated.View>

        {/* ===== SHIPPING ADDRESS SECTION ===== */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="location-sharp" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Text style={styles.sectionSubtitle}>Where should we deliver your order?</Text>
              </View>
            </View>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>Required</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* 1. PINCODE LOOKUP (Prominent First) */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>
                  Postal PIN Code <Text style={styles.requiredStar}>*</Text>
                </Text>
                {pincodeLoading && (
                  <View style={styles.detectingBadge}>
                    <ActivityIndicator size="small" color={fnpColors.primary} />
                    <Text style={styles.detectingText}>Detecting location...</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputBox}>
                <Ionicons name="navigate-outline" size={19} color={fnpColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.pinCode}
                  onChangeText={handlePincodeChange}
                  placeholder="Enter 6-digit PIN code (e.g. 400001)"
                  placeholderTextColor={fnpColors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {form.pinCode.length === 6 && !pincodeLoading && (
                  <Ionicons
                    name={pincodeStatus?.verified ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={20}
                    color={pincodeStatus?.verified ? fnpColors.success : fnpColors.textMuted}
                  />
                )}
              </View>

              {/* PIN Code Verification Banner */}
              {pincodeStatus && (
                <View
                  style={[
                    styles.pincodeStatusCard,
                    pincodeStatus.verified ? styles.pincodeStatusSuccess : styles.pincodeStatusInfo,
                  ]}
                >
                  <Ionicons
                    name={pincodeStatus.verified ? "checkmark-circle" : "information-circle"}
                    size={16}
                    color={pincodeStatus.verified ? "#2E7D32" : "#E65100"}
                  />
                  <Text
                    style={[
                      styles.pincodeStatusText,
                      pincodeStatus.verified ? styles.pincodeStatusTextSuccess : styles.pincodeStatusTextInfo,
                    ]}
                  >
                    {pincodeStatus.message}
                  </Text>
                </View>
              )}
            </View>

            {/* 2. RECIPIENT CONTACT INFO */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={19} color={fnpColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.fullName}
                  onChangeText={(v) => updateField("fullName", v)}
                  placeholder="Recipient's full name"
                  placeholderTextColor={fnpColors.textMuted}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.row}>
              {/* Phone */}
              <View style={[styles.halfInput, styles.inputGroup]}>
                <Text style={styles.inputLabel}>
                  Mobile Number <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput
                    style={styles.textInput}
                    value={form.phone}
                    onChangeText={(v) => updateField("phone", v.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10-digit number"
                    placeholderTextColor={fnpColors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <Text style={styles.fieldHelper}>For delivery agent coordination</Text>
              </View>

              {/* Email */}
              <View style={[styles.halfInput, styles.inputGroup]}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={18} color={fnpColors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={form.email}
                    onChangeText={(v) => updateField("email", v)}
                    placeholder="name@email.com"
                    placeholderTextColor={fnpColors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <Text style={styles.fieldHelper}>For invoice & tracking SMS</Text>
              </View>
            </View>

            {/* 3. DETAILED ADDRESS FIELDS */}
            {/* Flat / Building */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Flat, House No., Building Name <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons name="business-outline" size={19} color={fnpColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.houseNo}
                  onChangeText={(v) => updateField("houseNo", v)}
                  placeholder="e.g. Flat 402, Lotus Residency, Block B"
                  placeholderTextColor={fnpColors.textMuted}
                />
              </View>
            </View>

            {/* Street / Road / Area */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Street, Road, Area, Colony <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons name="map-outline" size={19} color={fnpColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.street}
                  onChangeText={(v) => updateField("street", v)}
                  placeholder="e.g. MG Road, Near Central Park, Sector 15"
                  placeholderTextColor={fnpColors.textMuted}
                />
              </View>
            </View>

            {/* Landmark (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Nearby Landmark <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.inputBox}>
                <Ionicons name="flag-outline" size={19} color={fnpColors.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.landmark}
                  onChangeText={(v) => updateField("landmark", v)}
                  placeholder="e.g. Opposite Metro Station / Near Grand Mall"
                  placeholderTextColor={fnpColors.textMuted}
                />
              </View>
            </View>

            {/* City & State (Auto-filled / Editable) */}
            <View style={styles.row}>
              <View style={[styles.halfInput, styles.inputGroup]}>
                <Text style={styles.inputLabel}>
                  City / District <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    value={form.city}
                    onChangeText={(v) => updateField("city", v)}
                    placeholder="City"
                    placeholderTextColor={fnpColors.textMuted}
                  />
                </View>
              </View>

              <View style={[styles.halfInput, styles.inputGroup]}>
                <Text style={styles.inputLabel}>
                  State <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.textInput}
                    value={form.state}
                    onChangeText={(v) => updateField("state", v)}
                    placeholder="State"
                    placeholderTextColor={fnpColors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* 4. ADDRESS TYPE SELECTION */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Save Address As</Text>
              <View style={styles.addressTypesRow}>
                {ADDRESS_TYPES.map((type) => {
                  const isSelected = form.addressType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.addressTypePill,
                        isSelected && styles.addressTypePillSelected,
                      ]}
                      onPress={() => updateField("addressType", type.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon}
                        size={16}
                        color={isSelected ? "#FFFFFF" : fnpColors.primary}
                      />
                      <Text
                        style={[
                          styles.addressTypeLabel,
                          isSelected && styles.addressTypeLabelSelected,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. DELIVERY INSTRUCTIONS (CHIPS) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Delivery Preferences <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <View style={styles.instructionsWrap}>
                {DELIVERY_INSTRUCTIONS.map((instruction) => {
                  const isSelected = form.deliveryInstructions === instruction;
                  return (
                    <TouchableOpacity
                      key={instruction}
                      style={[
                        styles.instructionChip,
                        isSelected && styles.instructionChipSelected,
                      ]}
                      onPress={() =>
                        updateField(
                          "deliveryInstructions",
                          isSelected ? "" : instruction
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.instructionChipText,
                          isSelected && styles.instructionChipTextSelected,
                        ]}
                      >
                        {instruction}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ===== PAYMENT GATEWAY INFO ===== */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="card-sharp" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                <Text style={styles.sectionSubtitle}>100% Encrypted & Instant Payment</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentMethodsContainer}>
            <View style={[styles.paymentMethod, styles.paymentMethodSelected]}>
              <View style={styles.paymentMethodLeft}>
                <View style={[styles.paymentIcon, styles.paymentIconSelected]}>
                  <Ionicons name="shield-checkmark" size={20} color={fnpColors.primary} />
                </View>
                <View style={styles.paymentInfoTextContainer}>
                  <Text style={styles.paymentMethodTitle}>Online Payment via Razorpay</Text>
                  <Text style={styles.paymentMethodDesc}>
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & NetBanking
                  </Text>
                </View>
              </View>
              <View style={styles.paymentRadioActive}>
                <View style={styles.paymentRadioActiveInner} />
              </View>
            </View>
          </View>

          {/* Coupon Code */}
          <View style={styles.couponContainer}>
            <View style={styles.inputBox}>
              <Ionicons name="pricetag-outline" size={18} color={fnpColors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder="Enter Coupon Code (Optional)"
                placeholderTextColor={fnpColors.textMuted}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.secureNote}>
            <Ionicons name="lock-closed" size={15} color={fnpColors.primary} />
            <Text style={styles.secureNoteText}>
              Your payment is processed via 256-bit bank-grade encryption. Your cart is emptied only upon successful confirmation.
            </Text>
          </View>
        </Animated.View>

        {/* ===== ORDER SUMMARY SECTION ===== */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="receipt-sharp" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <Text style={styles.sectionSubtitle}>{itemCount} item{itemCount > 1 ? "s" : ""} in cart</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
              <Text style={styles.editCartText}>Edit Cart</Text>
            </TouchableOpacity>
          </View>

          {cartItems.map((item) => {
            const itemImg = resolveImageUrl(item.image);
            return (
              <View key={item.lineKey} style={styles.cartItemRow}>
                {itemImg ? (
                  <Image source={{ uri: itemImg }} style={styles.cartItemThumb} contentFit="cover" />
                ) : (
                  <View style={styles.cartItemThumbPlaceholder}>
                    <Ionicons name="leaf-outline" size={18} color={fnpColors.primary} />
                  </View>
                )}
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product?.name || "GreenFibre Plant"}
                  </Text>
                  <Text style={styles.cartItemMeta}>
                    Qty: {item.quantity} {item.colorName ? `• ${item.colorName}` : ""}
                  </Text>
                </View>
                <Text style={styles.cartItemPrice}>
                  {formatPrice((item.price || 0) * item.quantity)}
                </Text>
              </View>
            );
          })}

          <View style={styles.summaryBreakdown}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(cartTotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping & Eco-Packing</Text>
              <Text style={styles.freeShippingText}>FREE</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <View>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalSubLabel}>Inclusive of all taxes & delivery</Text>
              </View>
              <Text style={styles.totalValue}>{formatPrice(payableTotal)}</Text>
            </View>
          </View>

          {/* Eco-Contribution Badge */}
          <View style={styles.ecoNote}>
            <LinearGradient colors={["#E8F5E9", "#C8E6C9"]} style={styles.ecoNoteGradient}>
              <MaterialCommunityIcons name="tree" size={22} color="#1B5E20" />
              <View style={styles.ecoTextContainer}>
                <Text style={styles.ecoNoteTitle}>1 Tree Planted With This Order</Text>
                <Text style={styles.ecoNoteText}>
                  Green Fibre plants a native tree for every verified customer purchase.
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ===== STICKY BOTTOM CHECKOUT ACTION BAR ===== */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.bottomContainer}>
        <View style={styles.bottomGradient}>
          <View style={styles.bottomContent}>
            {/* Price Column */}
            <View style={styles.bottomPriceColumn}>
              <Text style={styles.bottomTotalLabel}>Total Amount</Text>
              <Text style={styles.bottomTotalValue}>{formatPrice(payableTotal)}</Text>
              <Text style={styles.bottomFreeDeliveryBadge}>✓ Free Delivery</Text>
            </View>

            {/* Direct Proceed Button */}
            <TouchableOpacity
              style={[
                styles.directPlaceBtn,
                !isFormValid && !loading && styles.directPlaceBtnIncomplete,
              ]}
              onPress={handlePlaceOrder}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  loading
                    ? ["#555555", "#444444"]
                    : isFormValid
                    ? ["#1C4A2A", "#2E7D32"]
                    : ["#2E7D32", "#1C4A2A"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.directPlaceBtnGradient}
              >
                {loading ? (
                  <View style={styles.btnContentRow}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.directPlaceBtnText}>Connecting to Payment...</Text>
                  </View>
                ) : isFormValid ? (
                  <View style={styles.btnContentRow}>
                    <Text style={styles.directPlaceBtnText}>Proceed to Payment</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.btnContentRow}>
                    <Text style={styles.directPlaceBtnText}>Complete Address</Text>
                    <Ionicons name="arrow-forward-outline" size={16} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: fnpColors.cream,
  },
  scrollContainer: {
    paddingBottom: 130,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    ...shadows.soft,
  },

  // ===== PROGRESS =====
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: fnpColors.borderLight,
  },
  progressStepCircleActive: {
    backgroundColor: fnpColors.primary,
    borderColor: fnpColors.primary,
  },
  progressStepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: fnpColors.textMuted,
  },
  progressStepNumberActive: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  progressStepLabel: {
    fontSize: 11,
    color: fnpColors.textMuted,
    marginTop: 4,
    fontWeight: "500",
  },
  progressStepLabelActive: {
    fontSize: 11,
    color: fnpColors.primary,
    marginTop: 4,
    fontWeight: "700",
  },
  progressLine: {
    width: 44,
    height: 2,
    backgroundColor: fnpColors.borderLight,
    marginHorizontal: 6,
    marginBottom: 16,
  },
  progressLineActive: {
    backgroundColor: fnpColors.primary,
  },

  // ===== ASSURANCE BANNER =====
  assuranceBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 42, 0.08)",
    ...shadows.soft,
  },
  assuranceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  assuranceText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1C4A2A",
  },
  assuranceDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#E0E0E0",
  },

  // ===== SECTIONS =====
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    ...shadows.soft,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F3F3",
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: fnpColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: fnpColors.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: fnpColors.textSecondary,
    marginTop: 1,
  },
  requiredBadge: {
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  requiredBadgeText: {
    fontSize: 10,
    color: fnpColors.primary,
    fontWeight: "700",
  },

  // ===== FORM CONTROLS =====
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: fnpColors.text,
    marginBottom: 5,
  },
  requiredStar: {
    color: fnpColors.danger,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: "400",
    color: fnpColors.textMuted,
  },
  detectingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detectingText: {
    fontSize: 10,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: fnpColors.borderLight,
    borderRadius: 12,
    backgroundColor: "#FCFCFC",
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  phonePrefix: {
    fontSize: 14,
    fontWeight: "700",
    color: fnpColors.primary,
    marginRight: 8,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: fnpColors.text,
    height: "100%",
  },
  fieldHelper: {
    fontSize: 10,
    color: fnpColors.textMuted,
    marginTop: 3,
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },

  // ===== PINCODE STATUS CARD =====
  pincodeStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
  },
  pincodeStatusSuccess: {
    backgroundColor: "#F0F9F1",
    borderColor: "#C8E6C9",
  },
  pincodeStatusInfo: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFE082",
  },
  pincodeStatusText: {
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  pincodeStatusTextSuccess: {
    color: "#2E7D32",
  },
  pincodeStatusTextInfo: {
    color: "#B78103",
  },

  // ===== ADDRESS TYPE PILLS =====
  addressTypesRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  addressTypePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: fnpColors.borderLight,
    backgroundColor: "#FFFFFF",
  },
  addressTypePillSelected: {
    borderColor: fnpColors.primary,
    backgroundColor: fnpColors.primary,
  },
  addressTypeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: fnpColors.text,
  },
  addressTypeLabelSelected: {
    color: "#FFFFFF",
  },

  // ===== DELIVERY INSTRUCTIONS =====
  instructionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  instructionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    backgroundColor: "#F9F9F9",
  },
  instructionChipSelected: {
    borderColor: fnpColors.primary,
    backgroundColor: fnpColors.primaryLight,
  },
  instructionChipText: {
    fontSize: 11,
    color: fnpColors.textSecondary,
    fontWeight: "500",
  },
  instructionChipTextSelected: {
    color: fnpColors.primary,
    fontWeight: "700",
  },

  // ===== PAYMENT METHOD =====
  paymentMethodsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  paymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: fnpColors.borderLight,
    backgroundColor: "#FFFFFF",
  },
  paymentMethodSelected: {
    borderColor: fnpColors.primary,
    backgroundColor: "#F4FAF5",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentIconSelected: {
    backgroundColor: fnpColors.primaryLight,
  },
  paymentInfoTextContainer: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: fnpColors.text,
  },
  paymentMethodDesc: {
    fontSize: 11,
    color: fnpColors.textSecondary,
    marginTop: 2,
  },
  paymentRadioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: fnpColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  paymentRadioActiveInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: fnpColors.primary,
  },
  couponContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  secureNoteText: {
    fontSize: 11,
    color: fnpColors.textSecondary,
    flex: 1,
    lineHeight: 15,
  },

  // ===== ORDER SUMMARY & CART ITEMS =====
  editCartText: {
    fontSize: 12,
    fontWeight: "700",
    color: fnpColors.primary,
  },
  cartItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F7F7F7",
    gap: 10,
  },
  cartItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
  },
  cartItemThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: fnpColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: "600",
    color: fnpColors.text,
  },
  cartItemMeta: {
    fontSize: 11,
    color: fnpColors.textMuted,
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: fnpColors.primary,
  },
  summaryBreakdown: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: fnpColors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: fnpColors.text,
  },
  freeShippingText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingTop: 10,
    marginTop: 6,
    paddingBottom: 10,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: fnpColors.text,
  },
  totalSubLabel: {
    fontSize: 10,
    color: fnpColors.textMuted,
    marginTop: 1,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: fnpColors.primary,
  },

  // ===== ECO NOTE =====
  ecoNote: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  ecoNoteGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
  },
  ecoTextContainer: {
    flex: 1,
  },
  ecoNoteTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B5E20",
  },
  ecoNoteText: {
    fontSize: 10,
    color: "#2E7D32",
    marginTop: 1,
    lineHeight: 14,
  },

  // ===== EMPTY =====
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: fnpColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: fnpColors.textMuted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  primaryActionBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: fnpColors.primary,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 30,
  },

  // ===== STICKY BOTTOM BAR =====
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    ...shadows.medium,
  },
  bottomContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
  },
  bottomPriceColumn: {
    flex: 0.85,
  },
  bottomTotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: fnpColors.textMuted,
  },
  bottomTotalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: fnpColors.primary,
    marginTop: 1,
  },
  bottomFreeDeliveryBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2E7D32",
    marginTop: 1,
  },
  directPlaceBtn: {
    flex: 1.15,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.soft,
  },
  directPlaceBtnIncomplete: {
    opacity: 0.9,
  },
  directPlaceBtnGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  directPlaceBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
