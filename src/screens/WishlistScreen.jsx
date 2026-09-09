import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { DrawerActions } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectWishlistProducts,
  selectWishlistCount,
  selectWishlistLoading,
} from "../store/slices/wishlistSlice";
import {
  fetchWishlist,
  removeFromWishlist,
} from "../store/thunks/wishlistThunks";
import { addToCart, addToGuestCart } from "../store/thunks/cartThunks";
import { showToast } from "../store/slices/uiSlice";
import { validateCartSelection } from "../utils/cartSelection";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";

const { width } = Dimensions.get("window");

// Nature-inspired color palette
const natureColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  secondary: "#F57C00",
  secondaryLight: "#FFF3E0",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#4A4A4A",
  textMuted: "#8D8D8D",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#E53935",
  warning: "#FF9800",
};

export function WishlistScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlistProducts = useAppSelector(selectWishlistProducts);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const loading = useAppSelector(selectWishlistLoading);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Entrance animation
  useEffect(() => {
    if (wishlistProducts.length > 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
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
  }, [wishlistProducts]);

  const onRefresh = async () => {
    if (!isAuthenticated) {
      return;
    }
    setRefreshing(true);
    await dispatch(fetchWishlist());
    setRefreshing(false);
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
      dispatch(
        showToast({
          message: "💚 Removed from wishlist",
          type: "success",
        }),
      );
    } catch (error) {
      dispatch(
        showToast({
          message: error || "Failed to remove from wishlist",
          type: "error",
        }),
      );
    }
  };

  const handleAddToCart = async (product) => {
    const validation = validateCartSelection(product, 0, 1);
    if (!validation.ok) {
      dispatch(showToast({ message: validation.message, type: "error" }));
      return;
    }

    try {
      const targetProductId = product._id || product.id;
      if (isAuthenticated) {
        await dispatch(
          addToCart({
            productId: targetProductId,
            colorIndex: validation.colorIndex,
            quantity: 1,
          }),
        ).unwrap();
      } else {
        await dispatch(
          addToGuestCart({
            productId: targetProductId,
            colorIndex: validation.colorIndex,
            quantity: 1,
          }),
        ).unwrap();
      }

      dispatch(
        showToast({
          message: "🌿 Added to cart!",
          type: "success",
        }),
      );

      setTimeout(() => {
        navigation.navigate("Cart");
      }, 300);
    } catch (error) {
      dispatch(
        showToast({
          message: error || "Failed to add to cart",
          type: "error",
        }),
      );
    }
  };

  const handleClearAll = () => {
    if (!isAuthenticated || wishlistProducts.length === 0) {
      return;
    }

    Alert.alert(
      "🌿 Clear Wishlist",
      "Are you sure you want to remove all items from your wishlist?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(
                wishlistProducts.map((product) =>
                  dispatch(removeFromWishlist(product._id)).unwrap(),
                ),
              );
              setSelectedItems([]);
              dispatch(
                showToast({
                  message: "🗑️ Wishlist cleared",
                  type: "info",
                }),
              );
            } catch (error) {
              dispatch(
                showToast({
                  message: error || "Failed to clear wishlist",
                  type: "error",
                }),
              );
            }
          },
        },
      ],
    );
  };

  // Handle toggle selection mode
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedItems([]);
    }
  };

  // Handle toggle item selection
  const toggleItemSelection = (productId) => {
    setSelectedItems((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle bulk remove selected
  const handleBulkRemove = () => {
    if (selectedItems.length === 0) return;

    Alert.alert(
      "🌿 Remove Items",
      `Are you sure you want to remove ${selectedItems.length} items from wishlist?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            selectedItems.forEach((id) => {
              dispatch(removeFromWishlist(id));
            });
            setSelectedItems([]);
            setIsSelectionMode(false);
            dispatch(
              showToast({
                message: `💚 Removed ${selectedItems.length} items`,
                type: "success",
              }),
            );
          },
        },
      ],
    );
  };

  // Handle move all to cart
  const handleMoveAllToCart = () => {
    if (wishlistProducts.length === 0) return;

    Alert.alert(
      "🌿 Move All to Cart",
      `Add all ${wishlistProducts.length} items to cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add All",
          onPress: async () => {
            try {
              for (const product of wishlistProducts) {
                const validation = validateCartSelection(product, 0, 1);
                if (!validation.ok) {
                  continue;
                }

                const targetProductId = product._id || product.id;
                if (isAuthenticated) {
                  await dispatch(
                    addToCart({
                      productId: targetProductId,
                      colorIndex: validation.colorIndex,
                      quantity: 1,
                    }),
                  ).unwrap();
                } else {
                  await dispatch(
                    addToGuestCart({
                      productId: targetProductId,
                      colorIndex: validation.colorIndex,
                      quantity: 1,
                    }),
                  ).unwrap();
                }
              }

              dispatch(
                showToast({
                  message: `🌿 Added ${wishlistProducts.length} items to cart!`,
                  type: "success",
                }),
              );
              setTimeout(() => {
                navigation.navigate("Cart");
              }, 500);
            } catch (error) {
              dispatch(
                showToast({
                  message: error || "Failed to move items to cart",
                  type: "error",
                }),
              );
            }
          },
        },
      ],
    );
  };

  // Render wishlist item
  const renderWishlistItem = ({ item }) => {
    const isSelected = selectedItems.includes(item._id);
    const discount = item.originalPrice
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : 0;

    return (
      <View
        style={[styles.productCard, isSelected && styles.productCardSelected]}
      >
        <TouchableOpacity
          style={styles.productCardContent}
          onPress={() => {
            if (isSelectionMode) {
              toggleItemSelection(item._id);
            } else {
              navigation.navigate("ProductDetails", {
                productId: item._id,
                product: item,
              });
            }
          }}
          activeOpacity={0.8}
        >
          {/* Selection Checkbox */}
          {isSelectionMode && (
            <TouchableOpacity
              style={styles.selectionCheckbox}
              onPress={() => toggleItemSelection(item._id)}
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
          )}

          {/* Product Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={{
                uri:
                  resolveImageUrl(item.image) ||
                  resolveImageUrl(item.images?.[0]) ||
                  PLACEHOLDER_IMAGE,
              }}
              style={styles.productImage}
              contentFit="cover"
              transition={300}
            />

            {/* Discount Badge */}
            {discount > 0 && (
              <LinearGradient
                colors={[natureColors.secondary, natureColors.danger]}
                style={styles.discountBadge}
              >
                <Text style={styles.discountText}>-{discount}%</Text>
              </LinearGradient>
            )}

            {/* Eco Badge */}
            <View style={styles.ecoBadge}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.ecoBadgeGradient}
              >
                <Ionicons name="leaf-outline" size={10} color="#2E7D32" />
                <Text style={styles.ecoBadgeText}>Eco</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.productMeta}>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating || 4.5}</Text>
              </View>

              {item.inStock !== false && (
                <View style={styles.inStockBadge}>
                  <View style={styles.inStockDot} />
                  <Text style={styles.inStockText}>In Stock</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={() => handleAddToCart(item)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[natureColors.primary, natureColors.primaryDark]}
                  style={styles.addToCartGradient}
                >
                  <Ionicons name="bag-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.addToCartText}>Add to Cart</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveFromWishlist(item._id)}
                activeOpacity={0.7}
              >
                <Ionicons name="heart" size={20} color={natureColors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="Wishlist"
      >
        <EmptyState
          icon="heart-outline"
          title="Login to view wishlist"
          message="Sign in to save and sync your favorite products."
          actionLabel="Login"
          onAction={() => navigation.navigate("Login")}
        />
      </ScreenContainer>
    );
  }

  if (loading && wishlistProducts.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="Wishlist"
      >
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={[natureColors.primaryLight, "#C8E6C9"]}
            style={styles.loadingIcon}
          >
            <Ionicons name="heart" size={40} color="#2E7D32" />
          </LinearGradient>
          <Text style={styles.loadingText}>Loading your wishlist...</Text>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      </ScreenContainer>
    );
  }

  // If empty
  if (wishlistProducts.length === 0) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        headerTitle="Wishlist"
      >
        <EmptyState
          icon="heart-outline"
          title="Your wishlist is empty 💚"
          message="Start exploring our eco-friendly products and save your favorites."
          actionLabel="Explore Products"
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
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="Wishlist"
      headerRight={
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={toggleSelectionMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSelectionMode ? "close-outline" : "checkbox-outline"}
              size={22}
              color={isSelectionMode ? natureColors.danger : natureColors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={natureColors.textMuted}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Stats and Actions - These are NOT scrollable */}
        <View style={styles.statsContainer}>
          <View style={styles.statsLeft}>
            <LinearGradient
              colors={[natureColors.primaryLight, "#C8E6C9"]}
              style={styles.statsIcon}
            >
              <Ionicons name="heart" size={16} color="#2E7D32" />
            </LinearGradient>
            <Text style={styles.statsText}>
              {wishlistCount} {wishlistCount === 1 ? "Item" : "Items"}
            </Text>
          </View>
          {isSelectionMode && (
            <Text style={styles.selectionStats}>
              {selectedItems.length} selected
            </Text>
          )}
        </View>

        {/* Bulk Actions */}
        {isSelectionMode && selectedItems.length > 0 && (
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={styles.bulkActionBtn}
              onPress={handleBulkRemove}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[natureColors.danger, "#C62828"]}
                style={styles.bulkActionGradient}
              >
                <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                <Text style={styles.bulkActionText}>
                  Remove Selected ({selectedItems.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Move All to Cart Button */}
        {!isSelectionMode && (
          <TouchableOpacity
            style={styles.moveAllBtn}
            onPress={handleMoveAllToCart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[natureColors.secondary, "#E65100"]}
              style={styles.moveAllGradient}
            >
              <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
              <Text style={styles.moveAllText}>Move All to Cart</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Wishlist Items - ONLY FlatList, no nested ScrollView */}
        <FlatList
          data={wishlistProducts}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[natureColors.primary]}
              tintColor={natureColors.primary}
            />
          }
          ListFooterComponent={<View style={styles.bottomSpacer} />}
          // Remove any ScrollView wrapper
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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

  // ===== LOADING =====
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: natureColors.text,
    fontWeight: "600",
    marginBottom: 12,
  },

  // ===== STATS =====
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: natureColors.white,
    borderBottomWidth: 1,
    borderBottomColor: natureColors.borderLight,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statsIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statsText: {
    fontSize: 14,
    fontWeight: "600",
    color: natureColors.text,
  },
  selectionStats: {
    fontSize: 13,
    color: natureColors.primary,
    fontWeight: "600",
  },

  // ===== BULK ACTIONS =====
  bulkActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: natureColors.white,
    borderBottomWidth: 1,
    borderBottomColor: natureColors.borderLight,
  },
  bulkActionBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bulkActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  bulkActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ===== MOVE ALL BUTTON =====
  moveAllBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  moveAllGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  moveAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ===== LIST =====
  listContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },

  // ===== PRODUCT CARD =====
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: natureColors.white,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: natureColors.borderLight,
    overflow: "hidden",
  },
  productCardSelected: {
    borderColor: natureColors.primary,
    backgroundColor: natureColors.primaryLight,
  },
  productCardContent: {
    flex: 1,
    position: "relative",
  },
  selectionCheckbox: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
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

  // ===== IMAGE =====
  imageWrapper: {
    position: "relative",
    backgroundColor: "#F5F5F5",
    height: 160,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  ecoBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  ecoBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ecoBadgeText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#2E7D32",
  },

  // ===== PRODUCT INFO =====
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: natureColors.text,
    marginBottom: 4,
    height: 36,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: natureColors.text,
    fontWeight: "500",
  },
  inStockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  inStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2E7D32",
  },
  inStockText: {
    fontSize: 9,
    color: "#2E7D32",
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: natureColors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: natureColors.textMuted,
    textDecorationLine: "line-through",
  },

  // ===== ACTION BUTTONS =====
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addToCartBtn: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  addToCartGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: natureColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 20,
  },
});
