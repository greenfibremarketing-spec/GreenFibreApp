// src/screens/HomeScreen.jsx
// Green Fibre — Editorial home screen with Loved by Our Community & Green Fibre Club

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
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
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

// ── Category style presets ──
const CATEGORY_STYLE_PRESETS = {
  "kitchen-and-dining": {
    icon: "restaurant-outline",
    color: "#D97706",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
  },
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
  "home-and-living": {
    icon: "home-outline",
    color: "#166534",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
  },
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
  "storage-and-baskets": {
    icon: "file-tray-full-outline",
    color: "#854D0E",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
  },
  "storage-baskets": {
    icon: "file-tray-full-outline",
    color: "#854D0E",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
  },
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
  accessories: {
    icon: "bag-handle-outline",
    color: "#7C3AED",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
  },
  apparel: {
    icon: "shirt-outline",
    color: "#059669",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
  },
  plants: {
    icon: "leaf-outline",
    color: "#2E7D32",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80",
  },
};

const getCategoryPreset = (slug, name) => {
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();
  for (const [key, preset] of Object.entries(CATEGORY_STYLE_PRESETS)) {
    if (s.includes(key) || n.includes(key) || key.includes(s)) return preset;
  }
  return {
    icon: "grid-outline",
    color: "#1C4A2A",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80",
  };
};

// ── Hero Banners ──
const megaBanners = [
  {
    id: "hero-1",
    overline: "NEW SS26 COLLECTION",
    title: "Rooted in\nNature",
    subtitle: "Artisan-crafted kitchen & dining essentials for mindful living.",
    cta: "Shop the Collection",
    category: "kitchen-and-dining",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=85",
    gradient: ["rgba(18,46,26,0.85)", "rgba(18,46,26,0.3)", "transparent"],
  },
  {
    id: "hero-2",
    overline: "CONSCIOUS LIVING",
    title: "Handcrafted\nfor Home",
    subtitle: "Sustainable homeware made from renewable jute, clay, and bamboo.",
    cta: "Explore Home",
    category: "home-and-living",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=85",
    gradient: ["rgba(26,20,12,0.85)", "rgba(26,20,12,0.3)", "transparent"],
  },
  {
    id: "hero-3",
    overline: "ZERO WASTE ESSENTIALS",
    title: "Everyday\nImpact",
    subtitle: "Every product supports certified organic growers and artisans.",
    cta: "Discover More",
    category: "all",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&q=85",
    gradient: ["rgba(15,35,22,0.85)", "rgba(15,35,22,0.3)", "transparent"],
  },
];

// ── Features Strip ──
const features = [
  { icon: "leaf-outline", label: "100% Organic Fibres" },
  { icon: "infinite-outline", label: "Zero Plastic Packaging" },
  { icon: "airplane-outline", label: "Carbon-Neutral Delivery" },
  { icon: "shield-checkmark-outline", label: "Fair Trade Certified" },
];

// ── Customer Testimonials ──
const testimonials = [
  {
    id: "t1",
    name: "Aarav Sharma",
    role: "Verified Buyer",
    comment:
      "The bamboo cotton shirts are extraordinarily soft and breathable. Truly premium craftsmanship with zero plastic packaging!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
  },
  {
    id: "t2",
    name: "Pooja Patel",
    role: "Eco Architect",
    comment:
      "Green Fibre is my go-to for eco-friendly decor and kitchenware. The quality and aesthetic minimalism are unmatched.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    id: "t3",
    name: "Rohan Verma",
    role: "Conscious Shopper",
    comment:
      "Fast delivery, thoughtful compostable wrapping, and products that last. Love their environmental commitment.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80",
  },
];

export function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const bannerRef = useRef(null);
  const scrollViewRef = useRef(null);

  const { products, loading } = useAppSelector((s) => s.products);
  const { categories: apiCategories } = useAppSelector((s) => s.categories);

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
      {/* Gradient scrim */}
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.3, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Text overlay */}
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

  // ── Render Category Circle ──
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
        <View style={[styles.categoryBadge, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={11} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.categoryLabel} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer
      scroll={false}
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
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
        {/* ── 1. HERO BANNER CAROUSEL ───────────────────────── */}
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
              getItemLayout={(_, i) => ({
                length: screenWidth,
                offset: screenWidth * i,
                index: i,
              })}
            />
            {/* Dots */}
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

          {/* ── 2. FEATURES STRIP ─────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.featuresStrip}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name={f.icon} size={18} color={colors.primary} />
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* ── 3. CATEGORIES ─────────────────────────────────── */}
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

          {/* ── 4. BEST SELLERS GRID ──────────────────────────── */}
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

          {/* ── 5. EDITORIAL BANNER — Our Story ───────────────── */}
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.editorialBanner}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
              }}
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

          {/* ── 6. NEW ARRIVALS ───────────────────────────────── */}
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

          {/* ── 7. SUSTAINABILITY CALLOUT ─────────────────────── */}
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

          {/* ── 8. LOVED BY OUR COMMUNITY (Testimonials) ──────── */}
          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionOverline}>LOVED BY OUR COMMUNITY</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialsList}
            >
              {testimonials.map((t) => (
                <View key={t.id} style={styles.testimonialCard}>
                  <View style={styles.testimonialStars}>
                    {[...Array(t.rating)].map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#FFD700" />
                    ))}
                  </View>
                  <Text style={styles.testimonialComment} numberOfLines={4}>
                    "{t.comment}"
                  </Text>
                  <View style={styles.testimonialAuthorRow}>
                    <Image source={{ uri: t.avatar }} style={styles.testimonialAvatar} />
                    <View>
                      <Text style={styles.testimonialName}>{t.name}</Text>
                      <Text style={styles.testimonialRole}>{t.role}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          {/* ── 9. JOIN THE GREEN FIBRE CLUB ─────────────────── */}
          <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.vipBannerWrap}>
            <LinearGradient
              colors={["#1B5E20", "#122E1A"]}
              style={styles.vipBanner}
            >
              <Ionicons name="leaf" size={30} color="#81C784" style={{ marginBottom: 8 }} />
              <Text style={styles.vipTitle}>Join the Green Fibre Club</Text>
              <Text style={styles.vipSubtitle}>
                Get early access to conscious drops, tree planting certificates, and member-only rewards.
              </Text>
              <TouchableOpacity
                style={styles.vipBtn}
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.85}
              >
                <Text style={styles.vipBtnText}>Create Free Account</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
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
  sectionWrap: {
    marginTop: 8,
  },
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

  // ── Testimonials ─────────────────────────────────────────────
  testimonialsList: {
    paddingHorizontal: spacing.screen,
    gap: 14,
    paddingBottom: 4,
  },
  testimonialCard: {
    width: 270,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "space-between",
  },
  testimonialStars: {
    flexDirection: "row",
    gap: 3,
    marginBottom: 10,
  },
  testimonialComment: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
    marginBottom: 14,
  },
  testimonialAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  testimonialAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  testimonialName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
    color: colors.text,
  },
  testimonialRole: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
  },

  // ── VIP Club Banner ──────────────────────────────────────────
  vipBannerWrap: {
    paddingHorizontal: spacing.screen,
    marginTop: 28,
  },
  vipBanner: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    textAlign: "center",
  },
  vipTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
  },
  vipSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  vipBtn: {
    backgroundColor: colors.cream,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  vipBtnText: {
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
    color: colors.primaryDark,
  },
});

export default HomeScreen;
