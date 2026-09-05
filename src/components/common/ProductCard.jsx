import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Reanimated, { FadeInDown } from "react-native-reanimated";
import { formatPrice } from "../../utils/helpers";
import { colors, spacing, typography, shadows } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleWishlist as toggleWishlistThunk } from "../../store/thunks/wishlistThunks";
import { selectIsInWishlist } from "../../store/slices/wishlistSlice";
import { showToast } from "../../store/slices/uiSlice";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export function ProductCard({
  product,
  onPress,
  index = 0,
  variant = "default",
}) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const navigation = useNavigation();
  const isWishlisted = useAppSelector(selectIsInWishlist(product?._id));

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Handle wishlist press with animation
  const handleWishlistPress = async () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 10,
      }),
    ]).start();

    if (!product?._id) {
      return;
    }

    if (!isAuthenticated) {
      dispatch(
        showToast({
          message: "Please log in to use your wishlist.",
          type: "error",
        }),
      );
      navigation.navigate("Login");
      return;
    }

    try {
      const result = await dispatch(toggleWishlistThunk(product._id)).unwrap();
      dispatch(
        showToast({
          message: result.isWishlisted
            ? "❤️ Added to wishlist"
            : "💚 Removed from wishlist",
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        showToast({
          message: error || "Failed to update wishlist",
          type: "error",
        }),
      );
    }
  };

  // Calculate discount
  const getDiscount = () => {
    if (
      product?.originalPrice &&
      product?.price &&
      product.price < product.originalPrice
    ) {
      const discount =
        ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const discount = getDiscount();
  const isHorizontal = variant === "horizontal";
  const cardWidth = isHorizontal ? width * 0.6 : CARD_WIDTH;
  const imageHeight = isHorizontal ? 160 : 160;

  // Safely access product properties
  const productName = product?.name || "Product Name";
  const productPrice = product?.price || 0;
  const productOriginalPrice = product?.originalPrice || null;
  const productImage =
    product?.image ||
    product?.images?.[0] ||
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYOnLV6L1XFBOr96iaQOJe7T6ckbbO7MM2V_rRGnQMNA&s=10";
  const productCategory = product?.categoryName || product?.category?.name || product?.category || "";
  const productRating = product?.averageRating ?? product?.rating ?? null;
  const productReviewCount = product?.reviewCount || 0;
  const productStock = product?.totalStock ?? product?.stock;
  const isInStock = product?.inStock !== false;
  const isSustainable = product?.sustainable || false;
  const isNew = product?.isNew || false;
  // const inStock = product?.inStock !== false; // No longer used

  return (
    <Reanimated.View
      entering={FadeInDown.delay(index * 80)
        .duration(400)
        .springify()}
      style={[styles.wrapper, isHorizontal && styles.horizontalWrapper]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { width: cardWidth },
          isHorizontal && styles.horizontalCard,
        ]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Image Section */}
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          <Image
            source={{ uri: productImage }}
            style={styles.image}
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
          />

          {/* Image Overlay - removed to reduce visual clutter, keeping it subtle */}
          <View style={styles.imageOverlay} />

          {/* Eco Badge */}
          {isSustainable && (
            <View style={styles.ecoBadge}>
              <Ionicons name="leaf" size={12} color="#FFFFFF" />
              <Text style={styles.ecoBadgeText}>Eco</Text>
            </View>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={handleWishlistPress}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={20}
                color={isWishlisted ? "#DC2626" : "#1A1A1A"}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Stock Indicator */}
          {productStock !== undefined && productStock < 5 && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {productStock === 0
                  ? "Out of Stock"
                  : `Only ${productStock} left`}
              </Text>
            </View>
          )}
        </View>

        {/* Info Section - improved spacing to prevent overlap */}
        <View style={styles.info}>
          {/* Category */}
          {productCategory ? (
            <View style={styles.categoryRow}>
              <Text style={styles.category} numberOfLines={1}>
                {productCategory}
              </Text>
              {isNew && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Product Name */}
          <Text style={styles.name} numberOfLines={2}>
            {productName}
          </Text>

          {/* Rating */}
          {productRating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.rating}>{productRating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({productReviewCount} reviews)</Text>
            </View>
          ) : null}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(productPrice)}</Text>
            {productOriginalPrice && productOriginalPrice > productPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(productOriginalPrice)}
              </Text>
            )}
          </View>

          {/* ============================================================ */}
          {/* QUICK ADD BUTTON REMOVED — as requested */}
          {/* ============================================================ */}
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export const PRODUCT_CARD_WIDTH = CARD_WIDTH;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  horizontalWrapper: {
    marginRight: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    // Using shadow for iOS, elevation for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalCard: {
    flexDirection: "row",
    height: 160,
  },
  imageWrap: {
    width: "100%",
    position: "relative",
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40, // Reduced height to keep it subtle
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  ecoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#2E7D32",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ecoBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  wishlistBtn: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  stockBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stockText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  info: {
    padding: 14,
    paddingTop: 12,
    gap: 4, // consistent spacing between elements
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  category: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  newBadge: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 20,
    minHeight: 40, // ensures consistent space for 2 lines
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  reviews: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A5C2A",
  },
  originalPrice: {
    fontSize: 13,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  // ============================================================
  // QUICK ADD BUTTON STYLES REMOVED — no longer needed
  // ============================================================
});
