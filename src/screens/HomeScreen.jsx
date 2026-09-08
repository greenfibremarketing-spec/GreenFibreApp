// src/screens/HomeScreen.jsx
// Green Fibre — Premium editorial home screen
// Mockup reference: deep forest hero, serif headlines, botanical minimalism

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { ProductCard } from "../components/common/ProductCard";
import { ProductGridSkeleton } from "../components/common/LoadingSkeleton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProducts } from "../store/slices/productsSlice";
import { fetchCategories } from "../store/slices/categoriesSlice";
import { resolveImageUrl, PLACEHOLDER_IMAGE } from "../utils/catalogNormalize";

const { width: screenWidth } = Dimensions.get("window");

// ── Category style presets (icon, color, authentic eco-product photo/logo) ──
const CATEGORY_STYLE_PRESETS = {
  // Kitchen & Dining
  "kitchen-dining": {
    icon: "restaurant-outline",
    color: "#D97706",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },
  kitchen: {
    icon: "restaurant-outline",
    color: "#D97706",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },
  kitchenware: {
    icon: "restaurant-outline",
    color: "#D97706",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },
  dining: {
    icon: "cafe-outline",
    color: "#D97706",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },

  // Drinkware
  drinkware: {
    icon: "water-outline",
    color: "#0284C7",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  },
  bottles: {
    icon: "flask-outline",
    color: "#0284C7",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
  },

  // Home & Living
  "home-living": {
    icon: "home-outline",
    color: "#166534",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
  },
  "home-decor": {
    icon: "easel-outline",
    color: "#4E342E",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
  },
  decor: {
    icon: "easel-outline",
    color: "#4E342E",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
  },

  // Storage & Baskets
  "storage-baskets": {
    icon: "file-tray-full-outline",
    color: "#854D0E",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&q=80",
  },
  storage: {
    icon: "cube-outline",
    color: "#854D0E",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&q=80",
  },
  baskets: {
    icon: "basket-outline",
    color: "#854D0E",
    image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&q=80",
  },

  // Pet Care
  "pet-care": {
    icon: "paw-outline",
    color: "#EA580C",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
  },
  pets: {
    icon: "paw-outline",
    color: "#EA580C",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
  },

  // Plants & Garden
  plants: {
    icon: "leaf-outline",
    color: "#2E7D32",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80",
  },
  garden: {
    icon: "flower-outline",
    color: "#15803D",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80",
  },

  // Gifts & Hampers
  gifts: {
    icon: "gift-outline",
    color: "#BE123C",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80",
  },
  lifestyle: {
    icon: "sparkles-outline",
    color: "#7E22CE",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
  },
  stationery: {
    icon: "book-outline",
    color: "#0F766E",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
  },
  bags: {
    icon: "bag-handle-outline",
    color: "#9A3412",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
  },
};

const DEFAULT_CATEGORY_STYLE = {
  icon: "leaf-outline",
  color: colors.primary || "#1C4A2A",
  image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80",
};

const getCategoryPreset = (slug, name) => {
  const s = (slug || "").toLowerCase().trim();
  const n = (name || "").toLowerCase().trim();
  if (CATEGORY_STYLE_PRESETS[s]) return CATEGORY_STYLE_PRESETS[s];
  if (CATEGORY_STYLE_PRESETS[s.replace(/_/g, "-")]) return CATEGORY_STYLE_PRESETS[s.replace(/_/g, "-")];

  if (s.includes("kitchen") || n.includes("kitchen") || n.includes("dining")) return CATEGORY_STYLE_PRESETS["kitchen-dining"];
  if (s.includes("drink") || n.includes("drink") || s.includes("bottle") || n.includes("bottle")) return CATEGORY_STYLE_PRESETS["drinkware"];
  if (s.includes("home") || n.includes("home") || s.includes("living") || n.includes("living")) return CATEGORY_STYLE_PRESETS["home-living"];
  if (s.includes("storage") || n.includes("storage") || s.includes("basket") || n.includes("basket")) return CATEGORY_STYLE_PRESETS["storage-baskets"];
  if (s.includes("pet") || n.includes("pet") || n.includes("dog") || n.includes("cat")) return CATEGORY_STYLE_PRESETS["pet-care"];
  if (s.includes("plant") || n.includes("plant")) return CATEGORY_STYLE_PRESETS["plants"];
  if (s.includes("gift") || n.includes("gift")) return CATEGORY_STYLE_PRESETS["gifts"];
  if (s.includes("garden") || n.includes("garden")) return CATEGORY_STYLE_PRESETS["garden"];
  if (s.includes("bag") || n.includes("bag")) return CATEGORY_STYLE_PRESETS["bags"];
  if (s.includes("station") || n.includes("station")) return CATEGORY_STYLE_PRESETS["stationery"];

  return DEFAULT_CATEGORY_STYLE;
};

// ── Hero Banners ──────────────────────────────────────────────────────────
const megaBanners = [
  {
    id: "1",
    overline: "NEW COLLECTION",
    title: "Crafted from\nraw bamboo",
    subtitle: "Sustainable home essentials",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80",
    gradient: ["rgba(18,46,26,0.82)", "rgba(18,46,26,0.1)"],
    cta: "Explore Collection",
    category: "home-decor",
  },
  {
    id: "2",
    overline: "BEST SELLER",
    title: "Premium Eco\nGift Hampers",
    subtitle: "Thoughtfully curated for every occasion",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=900&q=80",
    gradient: ["rgba(18,46,26,0.80)", "rgba(18,46,26,0.05)"],
    cta: "Shop Hampers",
    category: "gifts",
  },
  {
    id: "3",
    overline: "SUSTAINABILITY",
    title: "Plantable &\nliving products",
    subtitle: "Seed paper, bamboo & recycled goods",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=80",
    gradient: ["rgba(18,46,26,0.78)", "rgba(18,46,26,0.05)"],
    cta: "Discover More",
    category: "plants",
  },
];

// ── Features strip ────────────────────────────────────────────────────────
const features = [
  { icon: "leaf-outline", label: "100% Sustainable" },
  { icon: "car-outline", label: "Free Shipping" },
  { icon: "ribbon-outline", label: "Premium Quality" },
  { icon: "refresh-outline", label: "Easy Returns" },
];

// ============================================================
// 🏠 MAIN COMPONENT
// ============================================================
export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const bannerRef = useRef(null);

  const { products, loading, error: productsError } = useAppSelector(
    (state) => state.products,
  );
  const apiCategories = useAppSelector((state) => state.categories.categories);

  const [refreshing, setRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Category UI list from API with matching logos & images
  const categoryUiList = useMemo(() => {
    return apiCategories.map((cat) => {
      const preset = getCategoryPreset(cat.slug, cat.name);
      const resolvedImg = cat.image ? resolveImageUrl(cat.image) : preset.image;
      return {
        id: cat.slug || cat._id,
        slug: cat.slug,
        title: cat.name,
        icon: preset.icon,
        color: preset.color,
        image: resolvedImg,
        _id: cat._id,
      };
    });
  }, [apiCategories]);

  // Image helper
  const getProductImage = useCallback((product) => {
    if (!product) return PLACEHOLDER_IMAGE;
    const raw =
      product.image ||
      product.images?.[0]?.url ||
      product.images?.[0] ||
      product.colors?.[0]?.images?.[0] ||
      null;
    return resolveImageUrl(raw) || PLACEHOLDER_IMAGE;
  }, []);

  // Featured products — first 6
  const featuredProducts = useMemo(
    () => (products || []).slice(0, 6),
    [products],
  );
  // Best sellers — products with rating
  const bestSellers = useMemo(
    () =>
      (products || [])
        .filter((p) => (p.averageRating ?? p.rating ?? 0) > 0)
        .slice(0, 4),
    [products],
  );

  // Banner auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const next = prev === megaBanners.length - 1 ? 0 : prev + 1;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchProducts()), dispatch(fetchCategories())]);
    setRefreshing(false);
  };

  const goToShop = (category = null) => {
    navigation.navigate("Tabs", {
      screen: "Shop",
      params: category ? { category } : undefined,
    });
  };

  const goToProductDetails = (product) => {
    navigation.navigate("ProductDetails", {
      productId: product._id,
      product,
    });
  };

  // ── Render Hero Banner Item ──────────────────────────────────
  const renderBannerItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.97}
      onPress={() => goToShop(item.category)}
      style={styles.heroBannerItem}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.heroBannerImage}
        contentFit="cover"
        transition={400}
      />
      {/* Gradient scrim from bottom 70% → transparent at top */}
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Text overlay — left-aligned, bottom */}
      <View style={styles.heroTextWrap}>
        <Text style={styles.heroOverline}>{item.overline}</Text>
        <Text style={styles.heroTitle}>{item.title}</Text>
        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
        <View style={styles.heroCta}>
          <Text style={styles.heroCtaText}>{item.cta}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.cream} />
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Render Category Circle with Photo Logo & Matching Icon Badge ──
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => goToShop(item.slug || item.id)}
      activeOpacity={0.82}
    >
      <View style={[styles.categoryCircleWrap, { borderColor: item.color + "35" }]}>
        <View style={styles.categoryCircleInner}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.categoryIconFallback, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.18)"]}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* Floating Mini Category Emblem / Icon Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={11} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.categoryLabel} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  // ── Render Product Card in grid ──────────────────────────────
  const renderProductCard = ({ item, index }) => (
    <ProductCard
      product={item}
      index={index}
      onPress={() => goToProductDetails(item)}
    />
  );

  return (
    <ScreenContainer onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* ── HERO BANNER CAROUSEL ─────────────────────────── */}
          <View style={styles.heroWrap}>
            <FlatList
              ref={bannerRef}
              data={megaBanners}
              keyExtractor={(item) => item.id}
              renderItem={renderBannerItem}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
                setCurrentBannerIndex(idx);
              }}
              getItemLayout={(_, i) => ({ length: screenWidth, offset: screenWidth * i, index: i })}
            />
            {/* Dots — bottom LEFT */}
            <View style={styles.bannerDots}>
              {megaBanners.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.bannerDot,
                    i === currentBannerIndex && styles.bannerDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* ── FEATURES STRIP ───────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.featuresStrip}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── CATEGORIES ───────────────────────────────────── */}
          {categoryUiList.length > 0 && (
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionOverline}>SHOP BY CATEGORY</Text>
              </View>
              <FlatList
                data={categoryUiList}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesList}
              />
            </Animated.View>
          )}

          {/* ── BEST SELLERS GRID ────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>BEST SELLERS</Text>
              <TouchableOpacity onPress={() => goToShop()}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <View style={styles.productGrid}>
                {(bestSellers.length > 0 ? bestSellers : featuredProducts).map(
                  (product, index) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      index={index}
                      onPress={() => goToProductDetails(product)}
                    />
                  ),
                )}
              </View>
            )}
          </Animated.View>

          {/* ── EDITORIAL BANNER — Our Story ─────────────────── */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.editorialBanner}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" }}
              style={styles.editorialImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(18,46,26,0.9)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.editorialText}>
              <Text style={styles.editorialOverline}>OUR STORY</Text>
              <Text style={styles.editorialTitle}>
                Making sustainability beautiful
              </Text>
              <TouchableOpacity
                style={styles.editorialBtn}
                onPress={() => navigation.navigate("About")}
              >
                <Text style={styles.editorialBtnText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── NEW ARRIVALS ──────────────────────────────────── */}
          {featuredProducts.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionOverline}>NEW ARRIVALS</Text>
                <TouchableOpacity onPress={() => goToShop()}>
                  <Text style={styles.sectionLink}>View all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={featuredProducts}
                keyExtractor={(item) => item._id}
                renderItem={({ item, index }) => (
                  <ProductCard
                    product={item}
                    index={index}
                    variant="horizontal"
                    onPress={() => goToProductDetails(item)}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 4 }}
              />
            </Animated.View>
          )}

          {/* ── SUSTAINABILITY CALLOUT ────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.sustainCallout}>
            <View style={styles.sustainIcon}>
              <Ionicons name="leaf" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sustainTitle}>Planet-positive packaging</Text>
              <Text style={styles.sustainBody}>
                Every order ships in 100% compostable materials. Zero plastic, always.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </ScreenContainer>
  );
}

// ── STYLES ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Hero ─────────────────────────────────────────────────────
  heroWrap: {
    position: "relative",
  },
  heroBannerItem: {
    width: screenWidth,
    height: 360,
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  heroBannerImage: {
    width: "100%",
    height: "100%",
  },
  heroTextWrap: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
  },
  heroOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.cream,
    opacity: 0.7,
    marginBottom: 10,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 38,
    lineHeight: 46,
    color: colors.cream,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.cream,
    opacity: 0.8,
    marginBottom: 20,
  },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(250,247,240,0.4)",
    alignSelf: "flex-start",
    paddingBottom: 3,
  },
  heroCtaText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.cream,
    letterSpacing: 0.3,
  },
  // Banner dots — bottom left
  bannerDots: {
    position: "absolute",
    bottom: 14,
    left: 24,
    flexDirection: "row",
    gap: 6,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(250,247,240,0.4)",
  },
  bannerDotActive: {
    width: 20,
    backgroundColor: colors.cream,
  },

  // ── Features strip ────────────────────────────────────────────
  featuresStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.creamLight,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  featureLabel: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },

  // ── Section headers ───────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingTop: 28,
    paddingBottom: 16,
  },
  sectionOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 11,
    letterSpacing: 1.6,
    color: colors.textSecondary,
  },
  sectionLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "50",
  },

  // ── Categories ────────────────────────────────────────────────
  categoriesList: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 4,
    gap: 14,
  },
  categoryItem: {
    alignItems: "center",
    width: 76,
  },
  categoryCircleWrap: {
    position: "relative",
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2,
    borderWidth: 2,
    backgroundColor: colors.creamLight,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: 31,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cream,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryIconFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  categoryLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 11,
    color: colors.text,
    textAlign: "center",
    lineHeight: 15,
  },

  // ── Product grid ──────────────────────────────────────────────
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
  },

  // ── Editorial banner ──────────────────────────────────────────
  editorialBanner: {
    height: 220,
    marginHorizontal: spacing.screen,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 28,
    position: "relative",
  },
  editorialImage: {
    width: "100%",
    height: "100%",
  },
  editorialText: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  editorialOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 9,
    letterSpacing: 1.8,
    color: colors.cream,
    opacity: 0.7,
    marginBottom: 8,
  },
  editorialTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 22,
    lineHeight: 30,
    color: colors.cream,
    marginBottom: 14,
  },
  editorialBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(250,247,240,0.5)",
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  editorialBtnText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.cream,
  },

  // ── Sustainability callout ─────────────────────────────────────
  sustainCallout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginHorizontal: spacing.screen,
    marginTop: 28,
    padding: 20,
    backgroundColor: colors.primarySurface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  sustainIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  sustainTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sustainBody: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
