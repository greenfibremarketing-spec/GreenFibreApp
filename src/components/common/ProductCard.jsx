// src/components/common/ProductCard.jsx
// Premium product card:
// - Wishlist button TOP-RIGHT (not buried at image bottom)
// - No overlay gradient — cream cards don't need it
// - DM Mono overline for category
// - Playfair-adjacent warm charcoal name
// - Terracotta discount badge
// - Clean shadow: rgba(28,74,42,0.06)

import React, { useRef, useState } from "react";
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
import { colors, spacing } from "../../theme";
import { useNavigation } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleWishlist as toggleWishlistThunk } from "../../store/thunks/wishlistThunks";
import { selectIsInWishlist } from "../../store/slices/wishlistSlice";
import { showToast } from "../../store/slices/uiSlice";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../../utils/catalogNormalize";

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
  const [imageFailed, setImageFailed] = useState(false);

  const handleWishlistPress = async () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.35, useNativeDriver: true, speed: 50, bounciness: 12 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 12 }),
    ]).start();

    if (!product?._id) return;

    if (!isAuthenticated) {
      dispatch(showToast({ message: "Please log in to use your wishlist.", type: "error" }));
      navigation.navigate("Login");
      return;
    }

    try {
      const result = await dispatch(toggleWishlistThunk(product._id)).unwrap();
      dispatch(showToast({
        message: result.isWishlisted ? "❤️ Added to wishlist" : "Removed from wishlist",
        type: "success",
      }));
    } catch (error) {
      dispatch(showToast({ message: error || "Failed to update wishlist", type: "error" }));
    }
  };

  const getDiscount = () => {
    if (product?.originalPrice && product?.price && product.price < product.originalPrice) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return 0;
  };

  const discount = getDiscount();
  const isHorizontal = variant === "horizontal";
  const cardWidth = isHorizontal ? width * 0.6 : CARD_WIDTH;

  const productName = product?.name || "Product";
  const productPrice = product?.price || 0;
  const productOriginalPrice = product?.originalPrice || null;
  const rawImage = product?.image || product?.images?.[0] || product?.colors?.[0]?.images?.[0] || null;
  const resolvedUri = resolveImageUrl(rawImage);
  const productImage = (!imageFailed && resolvedUri) ? resolvedUri : PLACEHOLDER_IMAGE;
  const productCategory =
    product?.categoryName ||
    product?.category?.name ||
    (typeof product?.category === "string" ? product.category : "");
  const productRating = product?.averageRating ?? product?.rating ?? null;
  const productReviewCount = product?.reviewCount || 0;
  const productStock = product?.totalStock ?? product?.stock;
  const isSustainable = product?.sustainable || false;
  const isNew = product?.isNew || false;

  return (
    <Reanimated.View
      entering={FadeInDown.delay(index * 70).duration(380).springify()}
      style={[styles.wrapper, isHorizontal && styles.horizontalWrapper]}
    >
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }, isHorizontal && styles.horizontalCard]}
        onPress={onPress}
        activeOpacity={0.92}
      >
        {/* ── Image ── */}
        <View style={[styles.imageWrap, { height: isHorizontal ? 140 : 168 }]}>
          <Image
            source={{ uri: productImage }}
            style={styles.image}
            contentFit="cover"
            transition={250}
            cachePolicy="memory-disk"
            onError={() => setImageFailed(true)}
          />

          {/* Eco badge — top left */}
          {isSustainable && (
            <View style={styles.ecoBadge}>
              <Ionicons name="leaf" size={10} color="#FFFFFF" />
              <Text style={styles.ecoBadgeText}>Eco</Text>
            </View>
          )}

          {/* Discount badge — top left below eco */}
          {discount > 0 && !isSustainable && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% off</Text>
            </View>
          )}

          {/* Wishlist — TOP RIGHT (key change from previous bottom-right) */}
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={handleWishlistPress}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={18}
                color={isWishlisted ? colors.terracotta : colors.textPrimary}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Low stock — bottom left, only when critical */}
          {productStock !== undefined && productStock > 0 && productStock < 5 && (
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>Only {productStock} left</Text>
            </View>
          )}
        </View>

        {/* ── Info ── */}
        <View style={styles.info}>
          {/* Category overline — DM Mono */}
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

          {/* Product name — warm charcoal */}
          <Text style={styles.name} numberOfLines={2}>
            {productName}
          </Text>

          {/* Rating — compact */}
          {productRating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color="#D4A853" />
              <Text style={styles.rating}>{productRating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({productReviewCount})</Text>
            </View>
          ) : null}

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(productPrice)}</Text>
            {productOriginalPrice && productOriginalPrice > productPrice && (
              <Text style={styles.originalPrice}>{formatPrice(productOriginalPrice)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Reanimated.View>
  );
}

export const PRODUCT_CARD_WIDTH = CARD_WIDTH;

const styles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  horizontalWrapper: { marginRight: 12 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "rgba(28,74,42,1)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  horizontalCard: {
    flexDirection: "row",
    height: 140,
  },
  imageWrap: {
    width: "100%",
    position: "relative",
    backgroundColor: colors.surfaceWarm,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  // ── Badges ────────────────────────────────────────────────
  ecoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ecoBadgeText: {
    color: "#FFFFFF",
    fontFamily: "DMMono_500Medium",
    fontSize: 9,
    letterSpacing: 0.6,
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: colors.terracotta,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  discountText: {
    color: "#FFFFFF",
    fontFamily: "DMSans_600SemiBold",
    fontSize: 10,
  },
  // ── Wishlist TOP-RIGHT ────────────────────────────────────
  wishlistBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.93)",
    borderRadius: 18,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  stockBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(28,20,10,0.7)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  stockText: {
    color: "#FFFFFF",
    fontFamily: "DMSans_400Regular",
    fontSize: 9,
  },
  // ── Info section ─────────────────────────────────────────
  info: {
    padding: 13,
    paddingTop: 11,
    gap: 4,
    flex: 1,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  category: {
    fontFamily: "DMMono_400Regular",
    fontSize: 9,
    color: colors.primary,
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  newBadge: {
    backgroundColor: "#D4A853",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontFamily: "DMMono_500Medium",
    fontSize: 8,
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    minHeight: 40,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  rating: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 11,
    color: colors.text,
  },
  reviews: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: colors.textMuted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: colors.primary,
  },
  originalPrice: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: "line-through",
  },
});
