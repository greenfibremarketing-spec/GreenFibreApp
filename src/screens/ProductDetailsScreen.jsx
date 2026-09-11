import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { CustomAlert } from "../components/common/CustomAlert";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { productService } from "../api/services/productService";
import { getProductGalleryImages, normalizeProduct, resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";
import { formatPrice } from "../utils/helpers";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { HeroSkeleton } from "../components/common/LoadingSkeleton";
import { ErrorState } from "../components/common/ErrorState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addToCart as addToCartThunk, addToGuestCart } from "../store/thunks/cartThunks";
import {
  toggleWishlist as toggleWishlistThunk,
} from "../store/thunks/wishlistThunks";
import { selectIsInWishlist } from "../store/slices/wishlistSlice";
import { validateCartSelection } from "../utils/cartSelection";
import { showToast } from "../store/slices/uiSlice";

const { width } = Dimensions.get("window");

// Nature-inspired color palette
const natureColors = {
  primary: "#2E7D32", // Deep forest green
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  secondary: "#F57C00", // Warm earth orange
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

export function ProductDetailsScreen({ navigation, route }) {
  const productId =
    route?.params?.productId ||
    route?.params?.product?._id ||
    route?.params?.product?.id;
  const initialProduct = route?.params?.product
    ? normalizeProduct(route.params.product)
    : null;

  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isWishlisted = useAppSelector(selectIsInWishlist(productId));
  const cartLoading = useAppSelector((state) => state.cart.loading);

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const cartScale = useRef(new Animated.Value(1)).current;
  const leafRotation = useRef(new Animated.Value(0)).current;

  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const loadProduct = () => {
    if (!productId) {
      if (!product) {
        setError("Product not found");
        setLoading(false);
      }
      return;
    }

    if (!product) {
      setLoading(true);
    }
    setError(null);
    productService
      .getProductById(productId)
      .then((p) => {
        if (!p) {
          if (!product) {
            setError("Product not found");
            setProduct(null);
          }
        } else {
          setProduct(p);
          setSelectedColorIndex(0);
          setSelectedImage(0);
        }
      })
      .catch((err) => {
        if (!product) {
          setError(err.message || "Failed to load product");
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  // Entrance animation
  useEffect(() => {
    if (product) {
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [product]);


  const selectedColorStock = product?.colors?.[selectedColorIndex]?.stock ?? 0;

  const promptLogin = (message) => {
    CustomAlert.alert("Login Required", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign In",
        onPress: () => navigation.navigate("Login"),
      },
    ]);
  };

  const performAddToCart = async (navigateToCart = true) => {
    if (!product) return;

    const validation = validateCartSelection(product, selectedColorIndex, quantity);
    if (!validation.ok) {
      dispatch(showToast({ message: validation.message, type: "error" }));
      return;
    }

    Animated.sequence([
      Animated.spring(cartScale, {
        toValue: 1.2,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(cartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const targetProductId = product._id || product.id || productId;
      if (isAuthenticated) {
        await dispatch(
          addToCartThunk({
            productId: targetProductId,
            colorIndex: validation.colorIndex,
            quantity: validation.quantity,
          }),
        ).unwrap();
        dispatch(showToast({ message: "🌿 Added to cart!", type: "success" }));
      } else {
        await dispatch(
          addToGuestCart({
            productId: targetProductId,
            colorIndex: validation.colorIndex,
            quantity: validation.quantity,
          }),
        ).unwrap();
        dispatch(
          showToast({
            message: "🌿 Saved to guest cart. Log in to sync.",
            type: "success",
          }),
        );
      }

      if (navigateToCart) {
        setTimeout(() => navigation.navigate("Cart"), 300);
      }
    } catch (err) {
      dispatch(
        showToast({
          message: err || "Failed to add to cart",
          type: "error",
        }),
      );
    }
  };

  const handleAddToCart = () => {
    performAddToCart(true);
  };

  const handleBuyNow = () => {
    performAddToCart(true);
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      promptLogin("Please log in to save items to your wishlist.");
      return;
    }

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const targetProductId = product._id || product.id || productId;
      const result = await dispatch(toggleWishlistThunk(targetProductId)).unwrap();
      dispatch(
        showToast({
          message: result.isWishlisted
            ? "❤️ Added to wishlist"
            : "💚 Removed from wishlist",
          type: "success",
        }),
      );
    } catch (err) {
      dispatch(
        showToast({
          message: err || "Failed to update wishlist",
          type: "error",
        }),
      );
    }
  };

  // Rotate leaf animation on scroll
  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.y;
    Animated.timing(leafRotation, {
      toValue: offset / 100,
      duration: 0,
      useNativeDriver: true,
    }).start();
  };

  // Get product images for the selected color variant
  const productImages = product
    ? getProductGalleryImages(product, selectedColorIndex)
    : [];
  const mainImage = productImages[selectedImage] || product?.image;

  // Floating leaves animation (decorative)
  const floatingLeaves = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingLeaves, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingLeaves, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleBackOrMenu = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  if (loading) {
    return (
      <ScreenContainer
        onMenuPress={handleBackOrMenu}
        headerTitle="Product"
      >
        <HeroSkeleton />
      </ScreenContainer>
    );
  }

  if (error || !product) {
    return (
      <ScreenContainer
        onMenuPress={handleBackOrMenu}
        headerTitle="Product"
      >
        <ErrorState
          message={error ?? "Product not found"}
          onRetry={loadProduct}
        />
      </ScreenContainer>
    );
  }

  // Calculate discount
  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;



  return (
    <ScreenContainer
      onMenuPress={handleBackOrMenu}
      headerTitle=""
      scroll={false}
      headerRight={
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleToggleWishlist}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? natureColors.danger : natureColors.text}
            />
          </Animated.View>
        </TouchableOpacity>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        {/* ===== IMAGE SECTION ===== */}
        <View style={styles.imageWrap}>
          <Image
            source={{
              uri:
                resolveImageUrl(mainImage) ||
                PLACEHOLDER_IMAGE,
            }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />

          {/* Nature-inspired decorative overlay */}
          <LinearGradient
            colors={["rgba(46,125,50,0.1)", "rgba(46,125,50,0)"]}
            style={styles.imageOverlay}
          />

          {/* Discount Badge */}
          {discount > 0 && (
            <LinearGradient
              colors={[natureColors.secondary, natureColors.danger]}
              style={styles.discountBadge}
            >
              <Ionicons name="pricetag-outline" size={12} color="#FFFFFF" />
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </LinearGradient>
          )}

          {/* Eco-friendly badge */}
          <View style={styles.ecoBadge}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.ecoBadgeGradient}
            >
              <Ionicons name="leaf-outline" size={14} color="#2E7D32" />
              <Text style={styles.ecoBadgeText}>Eco-Friendly</Text>
            </LinearGradient>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={[
              styles.wishlistBtn,
              isWishlisted && styles.wishlistBtnActive,
            ]}
            onPress={handleToggleWishlist}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={22}
                color={isWishlisted ? "#FFFFFF" : natureColors.textMuted}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Image Thumbnails */}
          {productImages.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {productImages.map((img, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.thumbnailItem,
                      selectedImage === index && styles.thumbnailItemActive,
                    ]}
                    onPress={() => setSelectedImage(index)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: resolveImageUrl(img) || PLACEHOLDER_IMAGE }}
                      style={styles.thumbnailImage}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ===== PRODUCT INFO ===== */}
        <View style={styles.details}>
          {/* Category with decorative line */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryWrapper}>
              <LinearGradient
                colors={[natureColors.primaryLight, "#C8E6C9"]}
                style={styles.categoryIcon}
              >
                <Ionicons name="paw-outline" size={14} color="#2E7D32" />
              </LinearGradient>
              <Text style={styles.category}>
                {product.categoryName ||
                  product.category?.name ||
                  (typeof product.category === "string"
                    ? product.category
                    : "Product")}
              </Text>
            </View>
            {product.inStock !== false && (
              <View style={styles.inStockBadge}>
                <View style={styles.inStockDot} />
                <Text style={styles.inStockText}>In Stock</Text>
              </View>
            )}
          </View>

          {/* Name with decorative leaf */}
          <View style={styles.nameRow}>
            <Text style={styles.name}>{product.name}</Text>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: leafRotation.interpolate({
                      inputRange: [-10, 10],
                      outputRange: ["-30deg", "30deg"],
                    }),
                  },
                ],
              }}
            >
              <Ionicons
                name="leaf-outline"
                size={24}
                color={natureColors.primary}
              />
            </Animated.View>
          </View>

          {/* Color variants */}
          {product.colors?.length > 0 && (
            <View style={styles.colorSection}>
              <Text style={styles.sectionTitle}>Available Colors</Text>
              <View style={styles.colorRow}>
                {product.colors.map((color, index) => {
                  const colorHex =
                    typeof color === "object" && color?.hex
                      ? color.hex
                      : "#CCCCCC";
                  const colorName =
                    typeof color === "object" && color?.name
                      ? color.name
                      : typeof color === "string"
                      ? color
                      : `Color ${index + 1}`;
                  return (
                    <TouchableOpacity
                      key={`${colorName}-${index}`}
                      style={[
                        styles.colorSwatch,
                        selectedColorIndex === index &&
                          styles.colorSwatchActive,
                        { backgroundColor: colorHex },
                      ]}
                      onPress={() => {
                        setSelectedColorIndex(index);
                        setSelectedImage(0);
                      }}
                      activeOpacity={0.8}
                    />
                  );
                })}
              </View>
              {product.colors[selectedColorIndex] ? (
                <Text style={styles.colorName}>
                  {typeof product.colors[selectedColorIndex] === "object"
                    ? product.colors[selectedColorIndex]?.name || ""
                    : product.colors[selectedColorIndex]}
                </Text>
              ) : null}
            </View>
          )}

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={
                    star <= Math.round(product.rating || 0)
                      ? "star"
                      : "star-outline"
                  }
                  size={16}
                  color="#FFD700"
                />
              ))}
            </View>
            <Text style={styles.rating}>{product.rating || 0}</Text>
            <Text style={styles.reviews}>
              ({product.reviewCount || 0} reviews)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Description with expand/collapse */}
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text
              style={styles.description}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {product.description}
            </Text>
            <Text style={styles.readMoreText}>
              {isExpanded ? "Read less" : "Read more"}
            </Text>
          </TouchableOpacity>

          {/* Features */}
          {product.featuresList?.length > 0 && (
            <View style={styles.featuresSection}>
              <View style={styles.featuresHeader}>
                <LinearGradient
                  colors={[natureColors.primaryLight, "#C8E6C9"]}
                  style={styles.featuresIcon}
                >
                  <Ionicons name="leaf-outline" size={15} color="#2E7D32" />
                </LinearGradient>
                <Text style={styles.featuresTitle}>🌿 Eco Features</Text>
              </View>
              {product.featuresList.map((item, index) => (
                <View key={`feat-${index}`} style={styles.featureItemRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                  <Text style={styles.featureItemText}>{String(item)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quantity */}
          <View style={styles.quantityRow}>
            <View style={styles.quantityLeft}>
              <Ionicons
                name="cube-outline"
                size={20}
                color={natureColors.text}
              />
              <Text style={styles.quantityLabel}>Quantity</Text>
            </View>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={18}
                  color={
                    quantity <= 1 ? natureColors.textMuted : natureColors.text
                  }
                />
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() =>
                  setQuantity(
                    Math.min(
                      selectedColorStock || quantity + 1,
                      quantity + 1,
                    ),
                  )
                }
                disabled={
                  selectedColorStock > 0 && quantity >= selectedColorStock
                }
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={natureColors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sustainability Impact Card */}
          <LinearGradient
            colors={["#E8F5E9", "#C8E6C9"]}
            style={styles.sustainabilityCard}
          >
            <View style={styles.sustainabilityContent}>
              <View style={styles.sustainabilityIcon}>
                <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
              </View>
              <View style={styles.sustainabilityText}>
                <Text style={styles.sustainabilityTitle}>
                  🌍 Sustainability Impact
                </Text>
                <Text style={styles.sustainabilitySubtitle}>
                  This product saves approximately 2.5kg of CO₂ emissions
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Eco-friendly shipping note */}
          <View style={styles.ecoNote}>
            <LinearGradient
              colors={["#FFF3E0", "#FFE0B2"]}
              style={styles.ecoNoteGradient}
            >
              <Ionicons name="leaf-outline" size={18} color="#E65100" />
              <Text style={styles.ecoNoteText}>
                🌱 This product is 100% sustainable and eco-friendly
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* ===== BOTTOM ACTION BAR ===== */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.footerContent}>
          {/* Price Column */}
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>TOTAL</Text>
            <Text style={styles.footerPriceValue}>
              {formatPrice(product.price * quantity)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.footerButtons}>
            {/* Add to Cart Button */}
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.cartBtnInner,
                  { transform: [{ scale: cartScale }] },
                ]}
              >
                <Ionicons
                  name="bag-add-outline"
                  size={17}
                  color={colors.primary}
                />
                <Text style={styles.cartBtnText}>Add to Cart</Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Buy Now Button */}
            <TouchableOpacity
              style={styles.buyBtn}
              onPress={handleBuyNow}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || "#122E1A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buyBtnGradient}
              >
                <Ionicons name="bag-check-outline" size={16} color="#FFFFFF" />
                <Text style={styles.buyBtnText}>Buy Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== IMAGE =====
  imageWrap: {
    height: 400,
    position: "relative",
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  ecoBadge: {
    position: "absolute",
    top: 16,
    left: 100,
  },
  ecoBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ecoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D32",
  },
  wishlistBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: natureColors.white,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.soft,
  },
  wishlistBtnActive: {
    backgroundColor: natureColors.danger,
  },
  thumbnailContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  thumbnailItem: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    ...shadows.small,
  },
  thumbnailItemActive: {
    borderColor: natureColors.primary,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F5F5F5",
  },

  // ===== DETAILS =====
  details: {
    padding: spacing.screen,
    backgroundColor: natureColors.white,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  categoryWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  category: {
    ...typography.caption,
    color: natureColors.primary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E7D32",
  },
  inStockText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2E7D32",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  name: {
    ...typography.h1,
    color: natureColors.text,
    fontSize: 22,
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  rating: {
    ...typography.body,
    fontWeight: "600",
    color: natureColors.text,
  },
  reviews: {
    ...typography.bodySmall,
    color: natureColors.textMuted,
  },
  colorSection: {
    marginBottom: spacing.lg,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorSwatchActive: {
    borderColor: natureColors.primary,
  },
  colorName: {
    ...typography.bodySmall,
    color: natureColors.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  price: {
    ...typography.hero,
    fontSize: 28,
    color: natureColors.primary,
    fontWeight: "900",
  },
  originalPrice: {
    ...typography.body,
    color: natureColors.textMuted,
    textDecorationLine: "line-through",
    fontSize: 16,
  },
  description: {
    ...typography.body,
    color: natureColors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  readMoreText: {
    ...typography.caption,
    color: natureColors.primary,
    fontWeight: "600",
    marginBottom: spacing.xl,
  },

  // ===== FEATURES =====
  featuresSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    ...typography.h3,
    color: natureColors.text,
    fontSize: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  featureIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    ...typography.body,
    color: natureColors.textSecondary,
    flex: 1,
    fontSize: 14,
  },

  // ===== QUANTITY =====
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: natureColors.borderLight,
    borderBottomWidth: 1,
    borderBottomColor: natureColors.borderLight,
    marginBottom: spacing.lg,
  },
  quantityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  quantityLabel: {
    ...typography.h3,
    color: natureColors.text,
    fontSize: 15,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: natureColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnDisabled: {
    backgroundColor: "#F5F5F5",
  },
  qtyValue: {
    ...typography.h3,
    color: natureColors.text,
    fontSize: 18,
    minWidth: 28,
    textAlign: "center",
  },

  // ===== SUSTAINABILITY CARD =====
  sustainabilityCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  sustainabilityContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sustainabilityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: natureColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  sustainabilityText: {
    flex: 1,
  },
  sustainabilityTitle: {
    ...typography.h3,
    color: "#1B5E20",
    fontSize: 14,
    fontWeight: "700",
  },
  sustainabilitySubtitle: {
    ...typography.bodySmall,
    color: "#2E7D32",
    fontSize: 12,
  },

  // ===== ECO NOTE =====
  ecoNote: {
    marginTop: spacing.md,
  },
  ecoNoteGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.buttonRadius,
  },
  ecoNoteText: {
    ...typography.bodySmall,
    color: "#E65100",
    fontWeight: "600",
    flex: 1,
  },

  // ===== FOOTER =====
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.cream || "#FAF7F0",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(28, 74, 42, 0.12)",
    paddingTop: 10,
    shadowColor: "rgba(28, 74, 42, 0.15)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  footerContent: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerPrice: {
    minWidth: 72,
    justifyContent: "center",
  },
  footerPriceLabel: {
    fontSize: 9,
    fontFamily: "DMMono_500Medium",
    color: colors.textMuted || "#8F958E",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  footerPriceValue: {
    fontFamily: "PlayfairDisplay_700Bold",
    color: colors.primary || "#1C4A2A",
    fontSize: 18,
    marginTop: 1,
  },
  footerButtons: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cartBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(28, 74, 42, 0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(28, 74, 42, 0.22)",
    overflow: "hidden",
  },
  cartBtnInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
  },
  cartBtnText: {
    color: colors.primary || "#1C4A2A",
    fontSize: 12.5,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.1,
  },
  buyBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: colors.primary || "#1C4A2A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  buyBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
  },
  buyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.2,
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 30,
  },

  // ===== ECO FEATURES =====
  featuresSection: {
    marginTop: 16,
    marginBottom: 8,
    padding: 14,
    backgroundColor: "rgba(46, 125, 50, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(46, 125, 50, 0.15)",
  },
  featuresHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  featuresIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  featuresTitle: {
    fontSize: 15,
    fontFamily: "DMSans_700Bold",
    color: "#1C4A2A",
  },
  featureItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  featureItemText: {
    fontSize: 13.5,
    fontFamily: "DMSans_400Regular",
    color: "#333333",
    flex: 1,
  },
});
