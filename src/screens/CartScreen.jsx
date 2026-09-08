import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Swipeable } from "react-native-gesture-handler";
import AnimatedComponent, {
  FadeInDown,
  FadeInUp,
  Layout,
} from "react-native-reanimated";
import {
  formatPrice,
  calculateCartTotal,
  getShippingCost,
  FREE_SHIPPING_THRESHOLD,
} from "../utils/helpers";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectCartItems,
  selectCartTotalAmount,
  selectGuestCartItems,
  selectCartLoading,
} from "../store/slices/cartSlice";
import {
  updateCartItem,
  removeCartItem,
  clearCart as clearServerCart,
  updateGuestCartLine,
  removeGuestCartLine,
} from "../store/thunks/cartThunks";
import { getCartLineKey } from "../utils/cartNormalize";

const { width } = Dimensions.get("window");

// Nature-inspired color palette
const natureColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  secondary: "#F57C00",
  secondaryLight: "#FFF3E0",
  gold: "#FFD700",
  goldLight: "#FFF8E1",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#4A4A4A",
  textMuted: "#8D8D8D",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#E53935",
  warning: "#FF9800",
  cream: "#FFF8F0",
  leafGreen: "#43A047",
  barkBrown: "#795548",
  skyBlue: "#64B5F6",
  sunset: "#FF7043",
};

// Recommended products (mock data) - Nature themed
const recommendedProducts = [
  {
    id: "rec1",
    name: "Bamboo Toothbrush Set",
    price: 299,
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400",
    ecoScore: 95,
  },
  {
    id: "rec2",
    name: "Reusable Straw Set",
    price: 199,
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400",
    ecoScore: 90,
  },
  {
    id: "rec3",
    name: "Eco Plant Pot Set",
    price: 399,
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400",
    ecoScore: 92,
  },
  {
    id: "rec4",
    name: "Organic Cotton Bag",
    price: 249,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400",
    ecoScore: 98,
  },
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

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState([]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const leafRotation = useRef(new Animated.Value(0)).current;

  const enrichedItems = useMemo(() => {
    return cartItems
      .map((item) => {
        const product =
          item.product || products.find((p) => p._id === item.productId);
        if (!product) {
          return null;
        }

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
        0,
      );
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;
  const itemCount = enrichedItems.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );

  const handleQuantityUpdate = (item, quantity) => {
    const { productId, colorIndex } = item;

    if (quantity < 1) {
      Alert.alert(
        "🌿 Remove Item",
        "Are you sure you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => handleRemoveItem(item),
          },
        ],
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

  // Handle bulk selection
  const toggleBulkSelection = (lineKey) => {
    setSelectedForBulk((prev) => {
      if (prev.includes(lineKey)) {
        return prev.filter((id) => id !== lineKey);
      }
      return [...prev, lineKey];
    });
  };

  // Handle bulk remove
  const handleBulkRemove = () => {
    if (selectedForBulk.length === 0) return;

    Alert.alert(
      "🌿 Remove Items",
      `Are you sure you want to remove ${selectedForBulk.length} items?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove All",
          style: "destructive",
          onPress: () => {
            selectedForBulk.forEach((lineKey) => {
              const item = enrichedItems.find((entry) => entry.lineKey === lineKey);
              if (item) {
                handleRemoveItem(item);
              }
            });
            setSelectedForBulk([]);
          },
        },
      ],
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    setShowCheckoutModal(true);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowCheckoutModal(false);
      navigation.navigate("Checkout");
    }, 1500);
  };

  // Handle scroll for leaf animation
  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    Animated.timing(leafRotation, {
      toValue: offset / 100,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // Render swipeable right actions
  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleRemoveItem(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[natureColors.danger, "#C62828"]}
          style={styles.deleteGradient}
        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteActionText}>Remove</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Render cart item
  const renderCartItem = ({ item, index }) => {
    const { product, quantity, colorIndex, colorName, price, availableStock, lineKey } = item;
    const unitPrice = price ?? product.price;
    const totalPrice = unitPrice * quantity;
    const isSelected = selectedForBulk.includes(lineKey);
    const maxStock = availableStock ?? product.colors?.[colorIndex]?.stock;

    return (
      <AnimatedComponent.View
        entering={FadeInUp.delay(index * 80).duration(400)}
        layout={Layout.springify()}
        style={styles.itemWrapper}
      >
        <Swipeable
          renderRightActions={() => renderRightActions(item)}
          overshootRight={false}
        >
          <View style={[styles.item, isSelected && styles.itemSelected]}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleBulkSelection(lineKey)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, isSelected && styles.checkboxActive]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            {/* Product Image */}
            <Image
              source={{
                uri:
                  resolveImageUrl(item.image) ||
                  resolveImageUrl(product.image) ||
                  PLACEHOLDER_IMAGE,
              }}
              style={styles.itemImage}
              contentFit="cover"
              transition={200}
            />

            {/* Product Info */}
            <View style={styles.itemInfo}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {product.name}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item)}
                  style={styles.itemDeleteBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color={natureColors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Eco Badge */}
              {colorName ? (
                <Text style={styles.ecoBadgeSmallText}>Color: {colorName}</Text>
              ) : null}

              <View style={styles.itemMeta}>
                <View style={styles.itemPriceContainer}>
                  <Text style={styles.itemPrice}>
                    {formatPrice(unitPrice)}
                  </Text>
                  {product.originalPrice && (
                    <Text style={styles.itemOriginalPrice}>
                      {formatPrice(product.originalPrice)}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemTotalPrice}>
                  {formatPrice(totalPrice)}
                </Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    quantity <= 1 && styles.qtyBtnDisabled,
                  ]}
                  onPress={() => handleQuantityUpdate(item, quantity - 1)}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={
                      quantity <= 1 ? natureColors.textMuted : natureColors.text
                    }
                  />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => handleQuantityUpdate(item, quantity + 1)}
                  disabled={maxStock > 0 && quantity >= maxStock}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={natureColors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Swipeable>
      </AnimatedComponent.View>
    );
  };

  // Render recommended products
  const renderRecommended = () => (
    <View style={styles.recommendedSection}>
      <View style={styles.recommendedHeader}>
        <View style={styles.recommendedHeaderLeft}>
          <LinearGradient
            colors={[natureColors.primaryLight, "#C8E6C9"]}
            style={styles.recommendedIcon}
          >
            <Ionicons name="leaf-outline" size={16} color="#2E7D32" />
          </LinearGradient>
          <Text style={styles.recommendedTitle}>🌿 You Might Also Like</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
        >
          <Text style={styles.recommendedSeeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.recommendedScroll}
        contentContainerStyle={styles.recommendedScrollContent}
      >
        {recommendedProducts.map((item, index) => (
          <AnimatedComponent.View
            key={item.id}
            entering={FadeInDown.delay(index * 100 + 500).duration(400)}
            style={styles.recommendedCard}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.recommendedImage}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.recommendedEcoBadge}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.recommendedEcoGradient}
              >
                <Ionicons name="leaf-outline" size={10} color="#2E7D32" />
                <Text style={styles.recommendedEcoText}>{item.ecoScore}%</Text>
              </LinearGradient>
            </View>
            <View style={styles.recommendedInfo}>
              <Text style={styles.recommendedName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.recommendedPrice}>
                {formatPrice(item.price)}
              </Text>
              <TouchableOpacity
                style={styles.recommendedAddBtn}
                onPress={() => {
                  Alert.alert("🌿 Added", `${item.name} added to cart!`);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[natureColors.primary, natureColors.primaryDark]}
                  style={styles.recommendedAddGradient}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </AnimatedComponent.View>
        ))}
      </ScrollView>
    </View>
  );

  // If cart is empty
  if (enrichedItems.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.goBack()}
        headerTitle="Cart"
      >
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty 🌱"
          message="Discover our sustainable products and start shopping eco-friendly."
          actionLabel="Start Shopping"
          onAction={() =>
            navigation.navigate("Main", {
              screen: "Tabs",
              params: {
                screen: "Shop",
              },
            })
          }
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="My Cart"
      scroll={false}
      headerRight={
        <View style={styles.headerRight}>
          {selectedForBulk.length > 0 && (
            <TouchableOpacity
              onPress={handleBulkRemove}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={natureColors.danger}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Cart", `${itemCount} items in your cart`)
            }
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={natureColors.text}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Cart Items */}
        <View style={styles.listContainer}>
          {/* Cart Header with count */}
          <View style={styles.cartHeader}>
            <View style={styles.cartHeaderLeft}>
              <LinearGradient
                colors={[natureColors.primaryLight, "#C8E6C9"]}
                style={styles.cartHeaderIcon}
              >
                <Ionicons name="leaf-outline" size={16} color="#2E7D32" />
              </LinearGradient>
              <Text style={styles.cartHeaderTitle}>
                {itemCount} {itemCount === 1 ? "Item" : "Items"}
              </Text>
            </View>
            <View style={styles.cartHeaderRight}>
              {selectedForBulk.length > 0 && (
                <Text style={styles.selectedCount}>
                  {selectedForBulk.length} selected
                </Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "🌿 Clear Cart",
                    "Are you sure you want to remove all items?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Clear All",
                        style: "destructive",
                        onPress: () => {
                          if (isAuthenticated) {
                            dispatch(clearServerCart());
                          } else {
                            enrichedItems.forEach((entry) => handleRemoveItem(entry));
                          }
                          setSelectedForBulk([]);
                        },
                      },
                    ],
                  );
                }}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {enrichedItems.map((item, index) => (
            <View key={item.lineKey}>
              {renderCartItem({ item, index })}
            </View>
          ))}
        </View>

        {/* Recommended Products */}
        {renderRecommended()}

        {/* Free Shipping Progress */}
        {subtotal < FREE_SHIPPING_THRESHOLD && (
          <AnimatedComponent.View
            entering={FadeInDown.delay(300).duration(400)}
            style={styles.shippingProgressWrapper}
          >
            <LinearGradient
              colors={[natureColors.primaryLight, "#C8E6C9"]}
              style={styles.shippingProgressContainer}
            >
              <View style={styles.shippingProgressHeader}>
                <View style={styles.shippingIconContainer}>
                  <Ionicons
                    name="leaf-outline"
                    size={18}
                    color={natureColors.primary}
                  />
                </View>
                <Text style={styles.shippingProgressText}>
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for
                  free shipping 🌿
                </Text>
              </View>
              <View style={styles.shippingProgressBar}>
                <LinearGradient
                  colors={[natureColors.primary, natureColors.leafGreen]}
                  style={[
                    styles.shippingProgressFill,
                    { width: `${freeShippingProgress}%` },
                  ]}
                />
              </View>
              <Text style={styles.shippingProgressLabel}>
                {Math.round(freeShippingProgress)}% towards free shipping
              </Text>
            </LinearGradient>
          </AnimatedComponent.View>
        )}

        {/* Sustainability Impact */}
        <AnimatedComponent.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.sustainabilityCard}
        >
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9"]}
            style={styles.sustainabilityGradient}
          >
            <View style={styles.sustainabilityContent}>
              <View style={styles.sustainabilityIcon}>
                <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
              </View>
              <View style={styles.sustainabilityText}>
                <Text style={styles.sustainabilityTitle}>
                  🌍 Your Carbon Savings
                </Text>
                <Text style={styles.sustainabilitySubtitle}>
                  This order saves approximately {Math.round(itemCount * 0.5)}kg
                  of CO₂ emissions
                </Text>
              </View>
            </View>
          </LinearGradient>
        </AnimatedComponent.View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ===== SUMMARY BOTTOM SHEET ===== */}
      <AnimatedComponent.View
        entering={FadeInUp.duration(500)}
        style={styles.summaryContainer}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.98)", "#FFFFFF"]}
          style={styles.summaryGradient}
        >
          <View style={styles.summary}>
            {/* Coupon Code Section */}
            <TouchableOpacity
              style={styles.couponSection}
              onPress={() =>
                Alert.alert("🌿 Coupon Code", "Enter your coupon code")
              }
              activeOpacity={0.7}
            >
              <Ionicons
                name="gift-outline"
                size={20}
                color={natureColors.primary}
              />
              <Text style={styles.couponText}>Apply Coupon Code</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={natureColors.textMuted}
              />
            </TouchableOpacity>

            <View style={styles.summaryDivider} />

            {/* Price Breakdown */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text
                style={[
                  styles.summaryValue,
                  shipping === 0 && styles.freeShippingText,
                ]}
              >
                {shipping === 0 ? "FREE 🌿" : formatPrice(shipping)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>Included</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <View>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalSubLabel}>Including all taxes</Text>
              </View>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <LinearGradient
                colors={[natureColors.primary, natureColors.primaryDark]}
                style={styles.checkoutGradient}
              >
                <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
                <Text style={styles.checkoutBtnText}>
                  {isProcessing ? "Processing..." : "Proceed to Checkout"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Eco-friendly note */}
            <View style={styles.checkoutNote}>
              <Ionicons name="leaf-outline" size={14} color="#2E7D32" />
              <Text style={styles.checkoutNoteText}>
                Eco-friendly delivery available
              </Text>
            </View>
          </View>
        </LinearGradient>
      </AnimatedComponent.View>

      {/* ===== CHECKOUT MODAL ===== */}
      <Modal
        visible={showCheckoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCheckoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.3)"]}
            style={styles.modalOverlayGradient}
          >
            <View style={styles.modalContent}>
              {isProcessing ? (
                <AnimatedComponent.View
                  entering={FadeInUp.duration(400)}
                  style={styles.modalLoaderContent}
                >
                  <View style={styles.modalIconContainer}>
                    <LinearGradient
                      colors={[natureColors.primaryLight, "#C8E6C9"]}
                      style={styles.modalIconGradient}
                    >
                      <Ionicons
                        name="leaf-outline"
                        size={48}
                        color={natureColors.primary}
                      />
                    </LinearGradient>
                  </View>
                  <Text style={styles.modalLoaderText}>
                    🌿 Processing your order...
                  </Text>
                  <View style={styles.modalLoaderBar}>
                    <Animated.View style={styles.modalLoaderFill} />
                  </View>
                </AnimatedComponent.View>
              ) : null}
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 280,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== CART HEADER =====
  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cartHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: natureColors.text,
  },
  cartHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedCount: {
    fontSize: 12,
    color: natureColors.primary,
    fontWeight: "600",
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: natureColors.danger,
  },

  // ===== CART ITEMS =====
  listContainer: {
    paddingHorizontal: 16,
  },
  itemWrapper: {
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: natureColors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: natureColors.borderLight,
  },
  itemSelected: {
    borderColor: natureColors.primary,
    backgroundColor: natureColors.primaryLight,
  },
  checkboxContainer: {
    marginRight: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: natureColors.borderLight,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: natureColors.primary,
    borderColor: natureColors.primary,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: natureColors.text,
    flex: 1,
    marginRight: 8,
  },
  itemDeleteBtn: {
    padding: 4,
  },
  ecoBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  ecoBadgeSmallText: {
    fontSize: 9,
    color: "#2E7D32",
    fontWeight: "600",
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    color: natureColors.primary,
    fontWeight: "600",
  },
  itemOriginalPrice: {
    fontSize: 11,
    color: natureColors.textMuted,
    textDecorationLine: "line-through",
  },
  itemTotalPrice: {
    fontSize: 14,
    color: natureColors.text,
    fontWeight: "700",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: natureColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {
    backgroundColor: "#F5F5F5",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },
  deleteAction: {
    height: "100%",
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    overflow: "hidden",
  },
  deleteGradient: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  // ===== RECOMMENDED =====
  recommendedSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  recommendedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recommendedHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendedIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendedTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: natureColors.text,
  },
  recommendedSeeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: natureColors.primary,
  },
  recommendedScroll: {
    flexDirection: "row",
  },
  recommendedScrollContent: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 140,
    backgroundColor: natureColors.white,
    borderRadius: 16,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: natureColors.borderLight,
  },
  recommendedImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F5F5F5",
  },
  recommendedEcoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  recommendedEcoGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recommendedEcoText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#2E7D32",
  },
  recommendedInfo: {
    padding: 10,
  },
  recommendedName: {
    fontSize: 13,
    fontWeight: "600",
    color: natureColors.text,
    marginBottom: 4,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: natureColors.primary,
    marginBottom: 8,
  },
  recommendedAddBtn: {
    alignSelf: "flex-end",
    borderRadius: 14,
    overflow: "hidden",
  },
  recommendedAddGradient: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== SHIPPING PROGRESS =====
  shippingProgressWrapper: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  shippingProgressContainer: {
    borderRadius: 16,
    padding: 16,
  },
  shippingProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  shippingIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: natureColors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  shippingProgressText: {
    fontSize: 12,
    color: natureColors.primaryDark,
    fontWeight: "600",
    flex: 1,
  },
  shippingProgressBar: {
    height: 4,
    backgroundColor: natureColors.white,
    borderRadius: 2,
    overflow: "hidden",
  },
  shippingProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  shippingProgressLabel: {
    fontSize: 11,
    color: natureColors.primaryDark,
    marginTop: 4,
    fontWeight: "500",
  },

  // ===== SUSTAINABILITY =====
  sustainabilityCard: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sustainabilityGradient: {
    borderRadius: 16,
    padding: 16,
  },
  sustainabilityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sustainabilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: natureColors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  sustainabilityText: {
    flex: 1,
  },
  sustainabilityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B5E20",
  },
  sustainabilitySubtitle: {
    fontSize: 12,
    color: "#2E7D32",
  },

  // ===== SUMMARY =====
  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  summaryGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  summary: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  couponSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: natureColors.primaryLight,
    borderRadius: 12,
  },
  couponText: {
    fontSize: 14,
    color: natureColors.primary,
    fontWeight: "600",
    flex: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: natureColors.borderLight,
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: natureColors.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    color: natureColors.text,
    fontWeight: "500",
  },
  freeShippingText: {
    color: natureColors.success,
    fontWeight: "700",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: natureColors.borderLight,
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: natureColors.text,
  },
  totalSubLabel: {
    fontSize: 11,
    color: natureColors.textMuted,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "900",
    color: natureColors.primary,
  },
  checkoutBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  checkoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  checkoutNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  checkoutNoteText: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "500",
  },

  // ===== MODAL =====
  modalOverlay: {
    flex: 1,
  },
  modalOverlayGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: natureColors.white,
    borderRadius: 24,
    padding: 32,
    width: width * 0.8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalLoaderContent: {
    alignItems: "center",
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLoaderText: {
    fontSize: 16,
    color: natureColors.text,
    fontWeight: "600",
    marginBottom: 16,
  },
  modalLoaderBar: {
    width: 200,
    height: 4,
    backgroundColor: natureColors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
  },
  modalLoaderFill: {
    width: "100%",
    height: "100%",
    backgroundColor: natureColors.primary,
    borderRadius: 2,
    animation: "pulse 1.5s ease-in-out infinite",
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 20,
  },
});
