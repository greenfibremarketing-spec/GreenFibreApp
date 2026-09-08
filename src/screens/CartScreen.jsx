// src/screens/CartScreen.jsx
// Green Fibre — Modern, Spacious & Elegant Cart Screen with Interactive Coupon System

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerActions } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import {
  formatPrice,
  getShippingCost,
  FREE_SHIPPING_THRESHOLD,
} from "../utils/helpers";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";
import { spacing, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCartItems,
  selectCartTotalAmount,
  selectGuestCartItems,
  selectCartLoading,
} from "../store/slices/cartSlice";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearServerCart,
  updateGuestCartLine,
  removeGuestCartLine,
  loadGuestCartState,
} from "../store/thunks/cartThunks";
import { fetchProducts } from "../store/slices/productsSlice";
import { getCartLineKey } from "../utils/cartNormalize";

const { width } = Dimensions.get("window");

// Premium Green Fibre Brand Colors
const brandColors = {
  primary: "#1C4A2A",
  primaryMedium: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#13351E",
  accent: "#D4AF37",
  accentLight: "#FFF9E6",
  cream: "#FAF7F2",
  creamDark: "#EDE8DF",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#555555",
  textMuted: "#888888",
  borderLight: "#EEEEEE",
  borderMedium: "#E0E0E0",
  success: "#2E7D32",
  successLight: "#E8F5E9",
  danger: "#D32F2F",
  dangerLight: "#FFEBEE",
  warning: "#E65100",
  warningLight: "#FFF3E0",
};

// Available Promo Codes
const AVAILABLE_COUPONS = [
  { code: "GREEN10", discountPercent: 10, maxDiscount: 500, label: "10% OFF", desc: "10% off on all sustainable items" },
  { code: "WELCOME50", flatDiscount: 50, minOrder: 299, label: "₹50 OFF", desc: "Flat ₹50 off on orders above ₹299" },
  { code: "PLANT100", flatDiscount: 100, minOrder: 799, label: "₹100 OFF", desc: "Flat ₹100 off on orders above ₹799" },
];

export function CartScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const serverCartItems = useAppSelector(selectCartItems);
  const guestCartItems = useAppSelector(selectGuestCartItems);
  const serverTotalAmount = useAppSelector(selectCartTotalAmount);
  const cartLoading = useAppSelector(selectCartLoading);
  const products = useAppSelector((s) => s.products.products);

  const cartItems = isAuthenticated ? serverCartItems : guestCartItems;

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount, message }
  const [couponError, setCouponError] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      dispatch(loadGuestCartState());
    }
  }, [dispatch, isAuthenticated, products.length]);

  const enrichedItems = useMemo(() => {
    return cartItems
      .map((item) => {
        const product =
          item.product ||
          products.find(
            (p) => p._id === item.productId || p.id === item.productId
          );
        if (!product) return null;

        const rawImage =
          item.image ||
          product.image ||
          product.colors?.[item.colorIndex]?.images?.[0];

        const image = resolveImageUrl(rawImage) || PLACEHOLDER_IMAGE;

        return {
          ...item,
          lineKey: item.lineKey || getCartLineKey(item.productId, item.colorIndex),
          product,
          image,
        };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const subtotal = isAuthenticated
    ? serverTotalAmount
    : enrichedItems.reduce(
        (total, item) => total + (item.price || item.product?.price || 0) * item.quantity,
        0
      );

  const rawShipping = getShippingCost(subtotal);
  const shipping = appliedCoupon?.code === "FREESHIP" ? 0 : rawShipping;

  // Calculate dynamic coupon discount based on current subtotal
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      const calc = (subtotal * appliedCoupon.discountPercent) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    }
    if (appliedCoupon.flatDiscount) {
      return Math.min(appliedCoupon.flatDiscount, subtotal);
    }
    return appliedCoupon.discountAmount || 0;
  }, [appliedCoupon, subtotal]);

  const payableTotal = Math.max(0, subtotal - discountAmount + shipping);
  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // Apply Coupon Logic
  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError("");

    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setCouponApplying(true);

    setTimeout(() => {
      setCouponApplying(false);
      const matched = AVAILABLE_COUPONS.find((c) => c.code === code);

      if (code === "FREESHIP") {
        setAppliedCoupon({
          code: "FREESHIP",
          discountAmount: rawShipping,
          message: "Free express delivery unlocked!",
        });
        setCouponInput("");
        return;
      }

      if (!matched) {
        setCouponError(`Coupon "${code}" is invalid or expired.`);
        return;
      }

      if (matched.minOrder && subtotal < matched.minOrder) {
        setCouponError(`Minimum order value of ${formatPrice(matched.minOrder)} required for "${matched.code}".`);
        return;
      }

      let calcDiscount = 0;
      if (matched.discountPercent) {
        calcDiscount = Math.round((subtotal * matched.discountPercent) / 100);
        if (matched.maxDiscount) calcDiscount = Math.min(calcDiscount, matched.maxDiscount);
      } else if (matched.flatDiscount) {
        calcDiscount = matched.flatDiscount;
      }

      setAppliedCoupon({
        ...matched,
        discountAmount: calcDiscount,
        message: `Saved ${formatPrice(calcDiscount)} with ${matched.code}!`,
      });
      setCouponInput("");
    }, 300);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handleQuantityUpdate = (item, quantity) => {
    const { productId, colorIndex } = item;

    if (quantity < 1) {
      Alert.alert(
        "Remove Item",
        `Remove "${item.product?.name || "this item"}" from your cart?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => handleRemoveItem(item),
          },
        ]
      );
      return;
    }

    if (isAuthenticated) {
      dispatch(updateCartItem({ productId, colorIndex, quantity }));
    } else {
      dispatch(updateGuestCartLine({ productId, colorIndex, quantity }));
    }
  };

  const handleRemoveItem = (item) => {
    const { productId, colorIndex } = item;
    if (isAuthenticated) {
      dispatch(removeCartItem({ productId, colorIndex }));
    } else {
      dispatch(removeGuestCartLine({ productId, colorIndex }));
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Shopping Bag",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Keep Items", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            if (isAuthenticated) {
              dispatch(clearServerCart());
            } else {
              enrichedItems.forEach((entry) => handleRemoveItem(entry));
            }
            handleRemoveCoupon();
          },
        },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    navigation.navigate("Checkout", {
      couponCode: appliedCoupon?.code || "",
      discountAmount,
    });
  };

  // If cart is empty
  if (enrichedItems.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() =>
          navigation.canGoBack()
            ? navigation.goBack()
            : navigation.dispatch(DrawerActions.openDrawer())
        }
        headerTitle="Shopping Bag"
      >
        <EmptyState
          icon="cart-outline"
          title="Your shopping bag is empty 🌱"
          message="Explore our handcrafted planters, plant sets, and eco-friendly home collections."
          actionLabel="Explore Catalog"
          onAction={() =>
            navigation.navigate("Main", {
              screen: "Tabs",
              params: { screen: "Shop" },
            })
          }
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      onMenuPress={() =>
        navigation.canGoBack()
          ? navigation.goBack()
          : navigation.dispatch(DrawerActions.openDrawer())
      }
      headerTitle="Shopping Bag"
      scroll={false}
      headerRight={
        <TouchableOpacity
          onPress={handleClearCart}
          style={styles.clearHeaderBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.clearHeaderBtnText}>Clear</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {/* ===== TOP STATUS / FREE SHIPPING PROGRESS BAR ===== */}
        <View style={styles.topProgressWrapper}>
          <View style={styles.topProgressCard}>
            <View style={styles.topProgressHeader}>
              <View style={styles.truckIconCircle}>
                <Ionicons
                  name={subtotal >= FREE_SHIPPING_THRESHOLD ? "checkmark-circle" : "car-outline"}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.topProgressText}>
                {subtotal >= FREE_SHIPPING_THRESHOLD
                  ? "Congratulations! You've unlocked FREE Express Delivery 🎉"
                  : `Add ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for FREE Delivery`}
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <LinearGradient
                colors={["#2E7D32", "#43A047"]}
                style={[styles.progressBarFill, { width: `${freeShippingProgress}%` }]}
              />
            </View>
          </View>
        </View>

        {/* ===== BAG ITEMS LIST ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Cart Items <Text style={styles.itemCountBadge}>({itemCount})</Text>
          </Text>
        </View>

        <View style={styles.itemsList}>
          {enrichedItems.map((item, index) => {
            const { product, quantity, colorIndex, colorName, price, availableStock } = item;
            const unitPrice = price ?? product.price ?? 0;
            const itemTotal = unitPrice * quantity;
            const maxStock = availableStock ?? product.colors?.[colorIndex]?.stock;

            return (
              <Animated.View
                key={item.lineKey}
                entering={FadeInDown.delay(index * 60).duration(350)}
                layout={Layout.springify()}
                style={styles.itemCard}
              >
                {/* Product Image */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  contentFit="cover"
                  transition={200}
                />

                {/* Product Details */}
                <View style={styles.itemDetails}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle} numberOfLines={2}>
                      {product.name || "Green Fibre Item"}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(item)}
                      style={styles.removeIconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color={brandColors.danger} />
                    </TouchableOpacity>
                  </View>

                  {/* Variant & Stock Info */}
                  <View style={styles.itemMetaRow}>
                    {colorName ? (
                      <View style={styles.colorPill}>
                        <Text style={styles.colorPillText}>Color: {colorName}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.unitPriceText}>{formatPrice(unitPrice)} each</Text>
                  </View>

                  {/* Price & Quantity Stepper */}
                  <View style={styles.itemBottomRow}>
                    <Text style={styles.itemTotalPrice}>{formatPrice(itemTotal)}</Text>

                    {/* Stepper */}
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[styles.stepperBtn, quantity <= 1 && styles.stepperBtnDanger]}
                        onPress={() => handleQuantityUpdate(item, quantity - 1)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={quantity <= 1 ? "trash-outline" : "remove"}
                          size={14}
                          color={quantity <= 1 ? brandColors.danger : brandColors.primary}
                        />
                      </TouchableOpacity>

                      <Text style={styles.stepperValue}>{quantity}</Text>

                      <TouchableOpacity
                        style={[
                          styles.stepperBtn,
                          maxStock > 0 && quantity >= maxStock && styles.stepperBtnDisabled,
                        ]}
                        onPress={() => handleQuantityUpdate(item, quantity + 1)}
                        disabled={maxStock > 0 && quantity >= maxStock}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={15} color={brandColors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* ===== COUPON & OFFERS SECTION ===== */}
        <View style={styles.couponCard}>
          <View style={styles.couponCardHeader}>
            <View style={styles.couponCardHeaderLeft}>
              <Ionicons name="pricetag" size={18} color={brandColors.primary} />
              <Text style={styles.couponCardTitle}>Coupons & Offers</Text>
            </View>
            {appliedCoupon && (
              <TouchableOpacity onPress={handleRemoveCoupon} activeOpacity={0.7}>
                <Text style={styles.removeCouponBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Applied Coupon Banner */}
          {appliedCoupon ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.appliedBanner}>
              <View style={styles.appliedBannerLeft}>
                <View style={styles.appliedCheckCircle}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.appliedCodeText}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedSavingsText}>
                    {appliedCoupon.message || `You saved ${formatPrice(discountAmount)}!`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleRemoveCoupon}
                style={styles.appliedRemoveCross}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={20} color={brandColors.textMuted} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <>
              {/* Interactive Input */}
              <View style={styles.couponInputWrapper}>
                <TextInput
                  style={styles.couponTextInput}
                  value={couponInput}
                  onChangeText={(val) => {
                    setCouponInput(val.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="Enter Promo Code (e.g. GREEN10)"
                  placeholderTextColor={brandColors.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={[
                    styles.couponApplyBtn,
                    !couponInput.trim() && styles.couponApplyBtnDisabled,
                  ]}
                  onPress={() => handleApplyCoupon(couponInput)}
                  disabled={!couponInput.trim() || couponApplying}
                  activeOpacity={0.8}
                >
                  {couponApplying ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.couponApplyBtnText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {couponError ? (
                <Text style={styles.couponErrorText}>{couponError}</Text>
              ) : null}

              {/* Quick Selectable Coupon Chips */}
              <View style={styles.couponChipsRow}>
                {AVAILABLE_COUPONS.map((cp) => (
                  <TouchableOpacity
                    key={cp.code}
                    style={styles.couponChip}
                    onPress={() => handleApplyCoupon(cp.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.chipDashedBorder}>
                      <Text style={styles.chipCodeText}>{cp.code}</Text>
                      <Text style={styles.chipLabelText}>{cp.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* ===== ORDER PRICE BREAKDOWN ===== */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardTitle}>Price Details ({itemCount} Items)</Text>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Bag Total</Text>
            <Text style={styles.summaryLineValue}>{formatPrice(subtotal)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.summaryLine}>
              <Text style={styles.summaryLineLabelGreen}>
                Coupon Discount ({appliedCoupon?.code})
              </Text>
              <Text style={styles.summaryLineValueGreen}>- {formatPrice(discountAmount)}</Text>
            </View>
          )}

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Estimated Delivery</Text>
            <Text
              style={[
                styles.summaryLineValue,
                shipping === 0 && styles.summaryLineValueGreen,
              ]}
            >
              {shipping === 0 ? "FREE" : formatPrice(shipping)}
            </Text>
          </View>

          <View style={styles.summaryLine}>
            <Text style={styles.summaryLineLabel}>Eco-Friendly Packing</Text>
            <Text style={styles.summaryLineValueGreen}>FREE</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryTotalRow}>
            <View>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalSub}>Inclusive of all taxes</Text>
            </View>
            <Text style={styles.summaryTotalValue}>{formatPrice(payableTotal)}</Text>
          </View>
        </View>

        {/* ===== TRUST ASSURANCES ===== */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={brandColors.primary} />
            <Text style={styles.trustText}>100% Genuine Plant Quality</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-circle-outline" size={20} color={brandColors.primary} />
            <Text style={styles.trustText}>Safe Transit Replacement</Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialCommunityIcons name="leaf" size={20} color={brandColors.primary} />
            <Text style={styles.trustText}>Eco Biodegradable Packing</Text>
          </View>
        </View>

        {/* Spacer for bottom bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ===== SLEEK STICKY BOTTOM CHECKOUT BAR ===== */}
      <View style={styles.stickyFooter}>
        <View style={styles.footerContent}>
          {/* Price side */}
          <View style={styles.footerPriceColumn}>
            <Text style={styles.footerTotalLabel}>Payable Amount</Text>
            <Text style={styles.footerTotalValue}>{formatPrice(payableTotal)}</Text>
            {discountAmount > 0 && (
              <Text style={styles.footerSavingsTag}>Saved {formatPrice(discountAmount)}</Text>
            )}
          </View>

          {/* Checkout CTA */}
          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={handleProceedToCheckout}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={["#1C4A2A", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.checkoutBtnGradient}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: brandColors.cream,
  },
  scrollContainer: {
    paddingBottom: 110,
  },
  clearHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    ...shadows.soft,
  },
  clearHeaderBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: brandColors.danger,
  },

  // ===== PROGRESS =====
  topProgressWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  topProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 42, 0.08)",
    ...shadows.soft,
  },
  topProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  truckIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: brandColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  topProgressText: {
    fontSize: 11,
    fontWeight: "600",
    color: brandColors.text,
    flex: 1,
  },
  progressBarTrack: {
    height: 5,
    backgroundColor: "#EEEEEE",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },

  // ===== SECTION HEADER =====
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: brandColors.text,
  },
  itemCountBadge: {
    color: brandColors.primary,
    fontWeight: "600",
  },

  // ===== ITEMS LIST =====
  itemsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.soft,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: brandColors.text,
    flex: 1,
    marginRight: 6,
    lineHeight: 18,
  },
  removeIconBtn: {
    padding: 2,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  colorPill: {
    backgroundColor: brandColors.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  colorPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: brandColors.primary,
  },
  unitPriceText: {
    fontSize: 11,
    color: brandColors.textMuted,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemTotalPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: brandColors.primary,
  },

  // ===== STEPPER =====
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  stepperBtnDanger: {
    backgroundColor: "#FFEBEE",
  },
  stepperBtnDisabled: {
    opacity: 0.5,
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "700",
    color: brandColors.text,
    minWidth: 24,
    textAlign: "center",
  },

  // ===== COUPONS & OFFERS CARD =====
  couponCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.soft,
  },
  couponCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  couponCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  couponCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: brandColors.text,
  },
  removeCouponBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: brandColors.danger,
  },
  couponInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: brandColors.borderMedium,
    borderRadius: 12,
    backgroundColor: "#FCFCFC",
    paddingLeft: 12,
    height: 44,
    overflow: "hidden",
  },
  couponTextInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: brandColors.text,
    height: "100%",
  },
  couponApplyBtn: {
    backgroundColor: brandColors.primary,
    height: "100%",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  couponApplyBtnDisabled: {
    backgroundColor: "#AAAAAA",
  },
  couponApplyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  couponErrorText: {
    fontSize: 11,
    color: brandColors.danger,
    marginTop: 5,
    marginLeft: 2,
    fontWeight: "500",
  },

  // Applied banner
  appliedBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F9F1",
    borderWidth: 1,
    borderColor: "#C8E6C9",
    borderRadius: 12,
    padding: 10,
  },
  appliedBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appliedCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  appliedCodeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1B5E20",
  },
  appliedSavingsText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2E7D32",
  },
  appliedRemoveCross: {
    padding: 2,
  },

  // Chips
  couponChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  couponChip: {
    borderRadius: 8,
    overflow: "hidden",
  },
  chipDashedBorder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: brandColors.primary,
    backgroundColor: brandColors.primaryLight,
  },
  chipCodeText: {
    fontSize: 11,
    fontWeight: "700",
    color: brandColors.primary,
  },
  chipLabelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2E7D32",
  },

  // ===== PRICE DETAILS CARD =====
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...shadows.soft,
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: brandColors.text,
    marginBottom: 10,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLineLabel: {
    fontSize: 13,
    color: brandColors.textSecondary,
  },
  summaryLineValue: {
    fontSize: 13,
    fontWeight: "600",
    color: brandColors.text,
  },
  summaryLineLabelGreen: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  summaryLineValueGreen: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2E7D32",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 8,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: brandColors.text,
  },
  summaryTotalSub: {
    fontSize: 10,
    color: brandColors.textMuted,
    marginTop: 1,
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: brandColors.primary,
  },

  // ===== TRUST GRID =====
  trustGrid: {
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 42, 0.06)",
  },
  trustText: {
    fontSize: 12,
    fontWeight: "600",
    color: brandColors.textSecondary,
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 30,
  },

  // ===== SLEEK STICKY FOOTER =====
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    ...shadows.medium,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerPriceColumn: {
    flex: 0.85,
  },
  footerTotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: brandColors.textMuted,
  },
  footerTotalValue: {
    fontSize: 19,
    fontWeight: "800",
    color: brandColors.primary,
    marginTop: 1,
  },
  footerSavingsTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D32",
  },
  checkoutBtn: {
    flex: 1.15,
    borderRadius: 14,
    overflow: "hidden",
    ...shadows.soft,
  },
  checkoutBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
