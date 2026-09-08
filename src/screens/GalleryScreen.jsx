// src/screens/GalleryScreen.jsx
// Green Fibre — Gallery Showcase Screen

import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { galleryContent } from "../data/content";
import { SectionHeader } from "../components/common/SectionHeader";
import { EmptyState } from "../components/common/EmptyState";
import { colors, spacing, typography, shadows } from "../theme";
import { useAppSelector } from "../store/hooks";

const { width, height } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const GAP = 12;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GAP) / 2;

const getImageSource = (image) => {
  if (!image) return null;
  if (typeof image === "string") return { uri: image };
  return image;
};

// Gallery Card Component
const GalleryCard = React.memo(({ item, index, onPress }) => {
  const imageSource = getImageSource(item.image);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: Math.min(index * 50, 400),
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    onPress(item);
  };

  return (
    <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image
              source={imageSource}
              style={styles.cardImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={32} color={colors.textLight || "#999"} />
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.imageGradient}
          />

          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.quickActionBtn}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (_) {}
            }}
          >
            <Ionicons name="heart-outline" size={16} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>

          <View style={styles.priceRow}>
            {item.price ? (
              <Text style={styles.price}>₹{item.price}</Text>
            ) : null}
            {item.rating && (
              <View style={styles.miniRating}>
                <Ionicons name="star" size={10} color="#FFD700" />
                <Text style={styles.miniRatingText}>
                  {Number(item.rating).toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {item.category && item.category !== "Uncategorized" && (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

// Category Chip Component
const CategoryChip = React.memo(({ category, isActive, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
      activeOpacity={0.7}
      onPress={() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (_) {}
        onPress(category);
      }}
    >
      <Text
        style={[
          styles.categoryChipText,
          isActive && styles.categoryChipTextActive,
        ]}
      >
        {category}
      </Text>
      {isActive && <View style={styles.categoryChipDot} />}
    </TouchableOpacity>
  );
});

export function GalleryScreen() {
  const navigation = useNavigation();
  const products = useAppSelector((s) => s.products.products);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Merge API products with static items
  const allItems = useMemo(() => {
    const staticItems = galleryContent?.items || [];
    const apiItems = (products || []).map((p) => ({
      id: p._id || p.id,
      title: p.name || p.title,
      category: p.category?.name || p.category || "Crafts",
      image: p.images?.[0]?.url || p.image || p.images?.[0],
      price: p.price,
      rating: p.rating || 4.8,
      badge: p.isFeatured ? "Featured" : p.badge || null,
      description: p.description,
      tags: p.tags || ["Eco-friendly", "Handmade"],
    }));

    const combined = [...apiItems, ...staticItems];
    const seen = new Set();
    return combined.filter((item) => {
      const key = item.id || item.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

  // Extract categories
  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    allItems.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [allItems]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return allItems;
    return allItems.filter((item) => item.category === selectedCategory);
  }, [allItems, selectedCategory]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleCardPress = (item) => {
    setSelectedItem(item);
    setIsLiked(false);
    setModalVisible(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    Animated.parallel([
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalScale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedItem(null);
    });
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    try {
      Haptics.notificationAsync(
        !isLiked
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning
      );
    } catch (_) {}
  };

  const handleShopNow = () => {
    closeModal();
    if (selectedItem?.id) {
      navigation.navigate("ProductDetails", { id: selectedItem.id });
    } else {
      navigation.navigate("Main", { screen: "Tabs", params: { screen: "Shop" } });
    }
  };

  // Render Header Component
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[colors.primaryDark || "#122E1A", colors.primary || "#1C4A2A"]}
        style={styles.heroBanner}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Ionicons name="sparkles" size={12} color="#D4A843" />
            <Text style={styles.heroBadgeText}>SUSTAINABLE GALLERY</Text>
          </View>
          <Text style={styles.heroTitle}>{galleryContent?.title || "Crafted with Care"}</Text>
          <Text style={styles.heroSubtitle}>
            {galleryContent?.subtitle || "Explore our gallery of handcrafted, eco-friendly creations."}
          </Text>
        </View>
      </LinearGradient>

      {categories.length > 1 && (
        <View style={styles.categoryContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategoryChip
                category={item}
                isActive={item === selectedCategory}
                onPress={handleCategorySelect}
              />
            )}
          />
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="images-outline"
      title="No Items Found"
      message={galleryContent?.emptyMessage || "No gallery items found."}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          activeOpacity={0.7}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gallery</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main FlatList */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item, index }) => (
          <GalleryCard item={item} index={index} onPress={handleCardPress} />
        )}
      />

      {/* Preview Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Animated.View
            style={[
              styles.previewContainer,
              {
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            <Pressable style={styles.previewContent} onPress={(e) => e.stopPropagation()}>
              <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.likeBtn, isLiked && styles.likeBtnActive]}
                onPress={toggleLike}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={isLiked ? "#E53935" : "#FFFFFF"}
                />
              </TouchableOpacity>

              <View style={styles.previewImageContainer}>
                <Image
                  source={getImageSource(selectedItem?.image)}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.85)"]}
                  style={styles.previewGradient}
                />
              </View>

              <View style={styles.previewDetails}>
                <View style={styles.previewHeaderRow}>
                  <View style={styles.previewCategory}>
                    <Text style={styles.previewCategoryText}>
                      {selectedItem?.category || "Handcrafted"}
                    </Text>
                  </View>
                  {selectedItem?.rating && (
                    <View style={styles.previewRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.previewRatingText}>
                        {Number(selectedItem.rating).toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.previewTitle}>{selectedItem?.title}</Text>

                {selectedItem?.description && (
                  <Text style={styles.previewDesc} numberOfLines={3}>
                    {selectedItem.description}
                  </Text>
                )}

                {selectedItem?.tags && (
                  <View style={styles.previewTags}>
                    {selectedItem.tags.map((tag, i) => (
                      <View key={i} style={styles.previewTag}>
                        <Ionicons name="leaf" size={10} color={colors.primary || "#1C4A2A"} />
                        <Text style={styles.previewTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.previewFooter}>
                  <View>
                    <Text style={styles.previewPriceLabel}>Price</Text>
                    <Text style={styles.previewPrice}>
                      {selectedItem?.price ? `₹${selectedItem.price}` : "Custom Craft"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.previewActionBtn}
                    activeOpacity={0.8}
                    onPress={handleShopNow}
                  >
                    <LinearGradient
                      colors={[colors.primary || "#1C4A2A", colors.primaryDark || "#122E1A"]}
                      style={styles.previewActionGradient}
                    >
                      <Text style={styles.previewActionText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream || "#FAF7F2",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen || 16,
    height: 52,
    backgroundColor: colors.cream || "#FAF7F2",
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#EFEFEF",
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.creamDark || "#EDE8DF",
  },
  headerTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: colors.text || "#1A1A1A",
  },
  headerRight: {
    width: 36,
  },
  headerContainer: {
    marginBottom: 16,
    paddingTop: 8,
  },
  heroBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: HORIZONTAL_PADDING,
  },
  heroContent: {
    alignItems: "flex-start",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "DMMono_500Medium",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "DMSans_400Regular",
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryList: {
    paddingHorizontal: HORIZONTAL_PADDING,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.creamDark || "#EDE8DF",
    borderWidth: 1,
    borderColor: colors.border || "#EAEAEA",
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.primarySurface || "#E8F5E9",
    borderColor: colors.primary || "#1C4A2A",
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: "DMSans_500Medium",
    color: colors.textSecondary || "#666666",
  },
  categoryChipTextActive: {
    color: colors.primaryDark || "#122E1A",
    fontFamily: "DMSans_700Bold",
  },
  categoryChipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary || "#1C4A2A",
  },
  listContent: {
    paddingBottom: 32,
  },
  columnWrapper: {
    paddingHorizontal: HORIZONTAL_PADDING,
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border || "#EFEFEF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  imageContainer: {
    width: "100%",
    height: CARD_WIDTH * 1.05,
    position: "relative",
    backgroundColor: "#F8F8F8",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "DMSans_700Bold",
  },
  quickActionBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: colors.text || "#1A1A1A",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
    color: colors.primary || "#1C4A2A",
  },
  miniRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniRatingText: {
    fontSize: 10,
    fontFamily: "DMSans_600SemiBold",
    color: colors.textSecondary || "#666666",
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.creamDark || "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 9,
    color: colors.textSecondary || "#777777",
    fontFamily: "DMSans_500Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  previewContainer: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  previewContent: {
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  likeBtn: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  likeBtnActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  previewImageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
    backgroundColor: "#1A1A1A",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  previewDetails: {
    padding: 18,
  },
  previewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  previewCategory: {
    backgroundColor: colors.primarySurface || "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  previewCategoryText: {
    fontSize: 11,
    color: colors.primaryDark || "#122E1A",
    fontFamily: "DMSans_700Bold",
  },
  previewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  previewRatingText: {
    fontSize: 12,
    fontFamily: "DMSans_700Bold",
    color: "#1A1A1A",
  },
  previewTitle: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay_700Bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  previewDesc: {
    fontSize: 12,
    color: colors.textSecondary || "#666666",
    lineHeight: 17,
    fontFamily: "DMSans_400Regular",
    marginBottom: 10,
  },
  previewTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  previewTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.creamDark || "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  previewTagText: {
    fontSize: 10,
    color: colors.textSecondary || "#555555",
    fontFamily: "DMSans_500Medium",
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || "#F0F0F0",
  },
  previewPriceLabel: {
    fontSize: 10,
    color: colors.textSecondary || "#888888",
    fontFamily: "DMSans_500Medium",
  },
  previewPrice: {
    fontSize: 18,
    fontFamily: "DMSans_700Bold",
    color: colors.primaryDark || "#122E1A",
  },
  previewActionBtn: {
    height: 42,
    borderRadius: 12,
    overflow: "hidden",
  },
  previewActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    height: "100%",
    gap: 6,
  },
  previewActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "DMSans_700Bold",
  },
});
