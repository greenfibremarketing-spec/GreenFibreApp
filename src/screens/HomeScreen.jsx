// src/screens/HomeScreen.jsx
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
  TextInput,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { ProductCard } from "../components/common/ProductCard";
import { ProductGridSkeleton } from "../components/common/LoadingSkeleton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProducts } from "../store/slices/productsSlice";
import { fetchCategories } from "../store/slices/categoriesSlice";
import { addToCart, addToGuestCart } from "../store/thunks/cartThunks";
import { validateCartSelection } from "../utils/cartSelection";
import { selectCartBadgeCount } from "../store/slices/cartSlice";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Responsive sizing helpers
const scale = (size) => (screenWidth / 375) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Placeholder image
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/400x400/2E7D32/FFFFFF?text=Product";

// ============================================================
// 📦 ENHANCED DATA (FNP Style + More)
// ============================================================

// Fallback styling for API categories (icons/colors only — names come from backend)
const CATEGORY_STYLE_PRESETS = {
  plants: { icon: "leaf-outline", color: "#2E7D32", bgColor: "#E8F5E9" },
  gifts: { icon: "gift-outline", color: "#C62828", bgColor: "#FFEBEE" },
  "home-decor": { icon: "home-outline", color: "#4E342E", bgColor: "#EFEBE9" },
  kitchen: { icon: "restaurant-outline", color: "#BF360C", bgColor: "#FBE9E7" },
  garden: { icon: "flower-outline", color: "#33691E", bgColor: "#F1F8E9" },
  lifestyle: { icon: "shirt-outline", color: "#4A148C", bgColor: "#F3E5F5" },
};

const DEFAULT_CATEGORY_STYLE = {
  icon: "apps-outline",
  color: "#2E7D32",
  bgColor: "#E8F5E9",
};

const socialLinks = [
  {
    id: "instagram",
    icon: "logo-instagram",
    color: "#E4405F",
    url: "https://www.instagram.com/your_username",
  },
  {
    id: "facebook",
    icon: "logo-facebook",
    color: "#1877F2",
    url: "https://www.facebook.com/your_page",
  },
  {
    id: "youtube",
    icon: "logo-youtube",
    color: "#FF0000",
    url: "https://www.youtube.com/@your_channel",
  },
  {
    id: "twitter",
    icon: "logo-twitter",
    color: "#1DA1F2",
    url: "https://x.com/your_username",
  },
];

const openSocialLink = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open the link.");
    }
  } catch (error) {
    Alert.alert("Error", "Something went wrong.");
  }
};

// Mega Banner Carousel Data
const megaBanners = [
  {
    id: "1",
    title: "🌿 Sustainable Corporate Gifting",
    subtitle: "Eco-friendly gifts that create a lasting impression",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    gradient: ["#1B5E20", "#2E7D32", "#43A047"],
    cta: "Explore Collection",
    discount: "100% Eco-Friendly",
    category: "corporate",
  },
  {
    id: "2",
    title: "🎁 Premium Eco Gift Hampers",
    subtitle: "Thoughtfully curated sustainable gifts for every occasion",
    image: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800",
    gradient: ["#2E7D32", "#388E3C", "#4CAF50"],
    cta: "Shop Gift Hampers",
    discount: "Best Seller",
    category: "gift-hampers",
  },
  {
    id: "3",
    title: "🌱 Plantable & Sustainable Products",
    subtitle: "Seed paper, bamboo essentials & recycled merchandise",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    gradient: ["#33691E", "#558B2F", "#7CB342"],
    cta: "Discover More",
    discount: "New Collection",
    category: "sustainable",
  },
];

// Loyalty Program Data
const loyaltyData = {
  points: 1250,
  nextTier: "Gold",
  progress: 75,
  tier: "Silver",
};

// Highlights
const highlights = [
  { title: "100% Sustainable", icon: "leaf-outline", color: "#2E7D32" },
  { title: "Free Shipping", icon: "car-outline", color: "#1565C0" },
  { title: "Premium Quality", icon: "ribbon-outline", color: "#C62828" },
  { title: "Eco Packaging", icon: "cube-outline", color: "#4E342E" },
  { title: "24/7 Support", icon: "headset-outline", color: "#4A148C" },
  { title: "Secure Payment", icon: "lock-closed-outline", color: "#1B5E20" },
];

// Blogs
const blogs = [
  {
    id: "1",
    title: "How to Start Sustainable Living",
    date: "2 days ago",
    readTime: "5 min",
    url: "https://example.com/blog/1",
  },
  {
    id: "2",
    title: "Benefits of Bamboo Products",
    date: "5 days ago",
    readTime: "3 min",
    url: "https://example.com/blog/2",
  },
  {
    id: "3",
    title: "Why Eco-Friendly Products Matter",
    date: "1 week ago",
    readTime: "4 min",
    url: "https://example.com/blog/3",
  },
];

// ============================================================
// 🏠 MAIN COMPONENT
// ============================================================

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();
  const searchInputRef = useRef(null);

  const { featured, products, loading } = useAppSelector(
    (state) => state.products,
  );
  const apiCategories = useAppSelector((state) => state.categories.categories);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const cartBadgeCount = useAppSelector(selectCartBadgeCount);

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [showFlashSale, setShowFlashSale] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 45,
    seconds: 30,
  });

  const categoryUiList = useMemo(() => {
    return apiCategories.map((category) => {
      const style =
        CATEGORY_STYLE_PRESETS[category.slug] || DEFAULT_CATEGORY_STYLE;

      return {
        id: category.slug || category._id,
        slug: category.slug,
        title: category.name,
        icon: style.icon,
        color: style.color,
        bgColor: style.bgColor,
        subtext: category.description || "Browse",
        count: "",
      };
    });
  }, [apiCategories]);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);

  // ============================================================
  // 📦 Get product image helper
  // ============================================================
  const getProductImage = useCallback((product) => {
    if (!product) return PLACEHOLDER_IMAGE;

    // Check multiple image sources
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") {
        return firstImage || PLACEHOLDER_IMAGE;
      }
      if (firstImage && firstImage.url) {
        return firstImage.url || PLACEHOLDER_IMAGE;
      }
    }

    if (product.image) {
      return product.image || PLACEHOLDER_IMAGE;
    }

    return PLACEHOLDER_IMAGE;
  }, []);

  // ============================================================
  // 📦 SEARCHABLE PRODUCTS - Memoized for performance
  // ============================================================
  const allSearchableProducts = useMemo(() => {
    // Get products from Redux store
    const storeProducts = products || [];

    // Create searchable items from store products
    return storeProducts.map((product) => ({
      id: product._id,
      name: product.name,
      price: `₹${product.price}`,
      image: getProductImage(product),
      rating: product.averageRating ?? product.rating ?? 0,
      reviews: product.reviewCount ?? 0,
      category: product.categoryName || product.category?.name || "Products",
      tag: product.isFeatured ? "⭐ Featured" : "🌿 Eco",
      _id: product._id,
      originalProduct: product, // Store reference to original product
    }));
  }, [products, getProductImage]);

  // ============================================================
  // 🎯 SEARCH FUNCTION - Optimized with useCallback
  // ============================================================
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      setIsSearching(true);

      if (query.trim().length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // Perform search
      const results = allSearchableProducts.filter(
        (item) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          (item.category &&
            item.category.toLowerCase().includes(query.toLowerCase())),
      );

      setSearchResults(results);
      setIsSearching(false);
    },
    [allSearchableProducts],
  );

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) =>
        prev === megaBanners.length - 1 ? 0 : prev + 1,
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Flash sale timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          if (minutes < 0) {
            minutes = 59;
            hours--;
            if (hours < 0) {
              clearInterval(timer);
              return { hours: 0, minutes: 0, seconds: 0 };
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withSpring(1);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      dispatch(fetchProducts()),
      dispatch(fetchCategories()),
    ]);
    setRefreshing(false);
  };

  // Navigation functions
  const goToShop = (category = null) => {
    navigation.navigate("Tabs", {
      screen: "Shop",
      params: category ? { category } : undefined,
    });
  };

  const goToProductDetails = (product) => {
    // Close search modal first
    setShowSearchModal(false);
    setSearchQuery("");
    setSearchResults([]);

    // Navigate to product details
    const productId = product.id || product._id;
    navigation.navigate("ProductDetails", {
      productId: productId,
      product: product.originalProduct || product,
    });
  };

  const goToCart = () => {
    navigation.navigate("Tabs", { screen: "Cart" });
  };

  const goToBlog = (blog) => {
    Alert.alert("Blog", `Reading: ${blog.title}`);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      setShowSearchModal(false);
      navigation.navigate("Tabs", {
        screen: "Shop",
        params: { searchQuery: searchQuery.trim() },
      });
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.id);
    goToShop(category.slug || category.id);
  };

  const handleBannerPress = (banner) => {
    if (banner.category) {
      goToShop(banner.category);
    } else {
      goToShop();
    }
  };

  const handleAddToCart = async (product) => {
    const sourceProduct = product.originalProduct || product;
    const validation = validateCartSelection(sourceProduct, 0, 1);

    if (!validation.ok) {
      Alert.alert("Unable to add", validation.message);
      return;
    }

    try {
      if (isAuthenticated) {
        await dispatch(
          addToCart({
            productId: sourceProduct._id || sourceProduct.id,
            colorIndex: validation.colorIndex,
            quantity: 1,
          }),
        ).unwrap();
      } else {
        await dispatch(
          addToGuestCart({
            productId: sourceProduct._id || sourceProduct.id,
            colorIndex: validation.colorIndex,
            quantity: 1,
          }),
        ).unwrap();
      }

      Alert.alert(
        "Added to Cart",
        `${sourceProduct.name} has been added to your cart!`,
      );
    } catch (error) {
      Alert.alert("Unable to add", error || "Failed to add to cart");
    }
  };

  const handleHighlightPress = (highlight) => {
    Alert.alert("Feature", `Learn more about ${highlight.title}`);
  };

  const handleLoyaltyRedeem = () => {
    Alert.alert(
      "Redeem Points",
      `You have ${loyaltyData.points} points. How would you like to redeem?`,
      [
        {
          text: "Get ₹50 Off",
          onPress: () => Alert.alert("Success", "₹50 discount applied!"),
        },
        {
          text: "View Rewards",
          onPress: () =>
            Alert.alert("Rewards", "Check out our rewards catalog"),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleBlogPress = (blog) => {
    goToBlog(blog);
  };

  const handleNewsletterSubscribe = () => {
    Alert.alert("Subscribed!", "Thank you for subscribing to our newsletter!");
  };

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  // Render Banner Dots
  const renderBannerDots = () => {
    return (
      <View style={styles.bannerDots}>
        {megaBanners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bannerDot,
              index === currentBannerIndex && styles.bannerDotActive,
            ]}
          />
        ))}
      </View>
    );
  };

  // Render Flash Sale Timer
  const renderFlashSaleTimer = () => {
    return (
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>⏰ Ends in</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>
            {String(timeLeft.hours).padStart(2, "0")}
          </Text>
          <Text style={styles.timerColon}>:</Text>
          <Text style={styles.timerText}>
            {String(timeLeft.minutes).padStart(2, "0")}
          </Text>
          <Text style={styles.timerColon}>:</Text>
          <Text style={styles.timerText}>
            {String(timeLeft.seconds).padStart(2, "0")}
          </Text>
        </View>
      </View>
    );
  };

  // Render search result item
  const renderSearchResultItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.searchResultItem}
        activeOpacity={0.7}
        onPress={() => goToProductDetails(item)}
      >
        <Image
          source={{ uri: item.image || PLACEHOLDER_IMAGE }}
          style={styles.searchResultImage}
          contentFit="cover"
          transition={300}
          placeholder={PLACEHOLDER_IMAGE}
        />

        <View style={styles.searchResultInfo}>
          <Text style={styles.searchResultName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.searchResultPrice}>{item.price}</Text>
          <View style={styles.searchResultMeta}>
            <View style={styles.searchResultRating}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.searchResultRatingText}>
                {item.rating || 4.5}
              </Text>
            </View>
            {item.tag && (
              <View style={styles.searchResultTag}>
                <Text style={styles.searchResultTagText}>{item.tag}</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.searchResultAdd}
          activeOpacity={0.7}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons
            name="cart-outline"
            size={moderateScale(20)}
            color="#2E7D32"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render trending product item
  const renderTrendingItem = ({ item, index }) => {
    const imageUrl = getProductImage(item);

    return (
      <Animated.View entering={FadeInUp.delay(index * 80 + 300).duration(400)}>
        <TouchableOpacity
          style={styles.trendingCard}
          activeOpacity={0.88}
          onPress={() => goToProductDetails(item)}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.trendingImage}
            contentFit="cover"
            transition={300}
            placeholder={PLACEHOLDER_IMAGE}
          />

          <View style={styles.trendingTag}>
            <Text style={styles.trendingTagText}>
              {item.categoryName || item.category?.name || "Trending"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.trendingHeart}
            activeOpacity={0.7}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons
              name="heart-outline"
              size={moderateScale(16)}
              color="#1A1A1A"
            />
          </TouchableOpacity>

          <View style={styles.trendingInfo}>
            <Text style={styles.trendingName} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={styles.trendingRating}>
              <Ionicons name="star" size={moderateScale(12)} color="#FFD700" />
              <Text style={styles.trendingRatingText}>
                {item.averageRating ?? item.rating ?? "—"}
              </Text>
              <Text style={styles.trendingReviews}>
                ({item.reviewCount ?? item.reviews ?? 0})</Text>
            </View>

            <View style={styles.trendingBottomRow}>
              <Text style={styles.trendingPrice}>₹{item.price}</Text>
              <TouchableOpacity
                style={styles.trendingAddCart}
                onPress={() => handleAddToCart(item)}
              >
                <Ionicons
                  name="cart-outline"
                  size={moderateScale(16)}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Render flash sale item
  const renderFlashSaleItem = ({ item }) => {
    const imageUrl = getProductImage(item);

    return (
      <TouchableOpacity
        style={styles.flashSaleCard}
        activeOpacity={0.8}
        onPress={() => goToProductDetails(item)}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.flashSaleImage}
          contentFit="cover"
          transition={300}
          placeholder={PLACEHOLDER_IMAGE}
        />
        <Text style={styles.flashSaleName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.flashSalePriceRow}>
          <Text style={styles.flashSalePrice}>₹{item.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.flashSaleCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={moderateScale(16)} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ============================================================
  // 🏗️ RENDER
  // ============================================================

  return (
    <ScreenContainer onMenuPress={() => navigation.openDrawer()}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFFFFF" }}
        edges={["top"]}
      >
        <Animated.ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.container}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 20 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2E7D32"]}
            />
          }
        >
          {/* ============================================== */}
          {/* 🏷️ TOP BAR WITH GREETING */}
          {/* ============================================== */}
          <Animated.View style={[styles.topBar, animatedHeaderStyle]}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>🌱 Good Morning!</Text>
              <Text style={styles.greetingSub}>
                Find your perfect eco product
              </Text>
            </View>

            <View style={styles.rightHeader}>
              <TouchableOpacity
                style={styles.iconBtn}
                activeOpacity={0.7}
                onPress={() => {
                  setShowSearchModal(true);
                  setTimeout(() => {
                    searchInputRef.current?.focus();
                  }, 300);
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={moderateScale(22)}
                  color="#1A1A1A"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, styles.cartBtn]}
                activeOpacity={0.7}
                onPress={goToCart}
              >
                <Ionicons
                  name="bag-outline"
                  size={moderateScale(22)}
                  color="#1A1A1A"
                />
                {cartBadgeCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.badgeText}>
                      {cartBadgeCount > 9 ? "9+" : cartBadgeCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ============================================== */}
          {/* 🌟 MEGA BANNER CAROUSEL */}
          {/* ============================================== */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            style={styles.megaBannerWrapper}
          >
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={() => handleBannerPress(megaBanners[currentBannerIndex])}
            >
              <View style={styles.megaBanner}>
                <Image
                  source={{ uri: megaBanners[currentBannerIndex].image }}
                  style={styles.megaBannerImage}
                  contentFit="cover"
                  transition={500}
                />
                <LinearGradient
                  colors={megaBanners[currentBannerIndex].gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.megaBannerOverlay}
                >
                  <View style={styles.megaBannerContent}>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {megaBanners[currentBannerIndex].discount}
                      </Text>
                    </View>
                    <Text style={styles.megaBannerTitle}>
                      {megaBanners[currentBannerIndex].title}
                    </Text>
                    <Text style={styles.megaBannerSubtitle}>
                      {megaBanners[currentBannerIndex].subtitle}
                    </Text>
                    <View style={styles.megaBannerBtn}>
                      <Text style={styles.megaBannerBtnText}>
                        {megaBanners[currentBannerIndex].cta}
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={moderateScale(18)}
                        color="#fff"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
            {renderBannerDots()}
          </Animated.View>

          {/* ============================================== */}
          {/* 🎯 QUICK CATEGORIES */}
          {/* ============================================== */}
          <Animated.View
            entering={FadeInDown.delay(150).duration(500)}
            style={styles.finderWrapper}
          >
            <View style={styles.finderHeader}>
              <View>
                <Text style={styles.finderTitle}>🎁 Find the Perfect Gift</Text>
                <Text style={styles.finderSubtitle}>Browse by category</Text>
              </View>
              <TouchableOpacity onPress={() => goToShop()}>
                <Text style={styles.finderSeeAll}>See All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categoryUiList}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoryList}
              ListEmptyComponent={
                !loading ? (
                  <Text style={styles.finderSubtitle}>No categories available</Text>
                ) : null
              }
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInUp.delay(index * 60).duration(400)}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      { backgroundColor: item.bgColor },
                      selectedCategory === item.id &&
                        styles.categoryCardSelected,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryPress(item)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: item.bgColor },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={moderateScale(22)}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.categoryText}>{item.title}</Text>
                    <Text style={styles.categorySubtext}>{item.subtext}</Text>
                    <View style={styles.categoryCount}>
                      <Text style={styles.categoryCountText}>{item.count}</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          </Animated.View>

          {/* ============================================== */}
          {/* ⚡ FLASH SALE */}
          {/* ============================================== */}
          {showFlashSale && products && products.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(500)}
              style={styles.flashSaleWrapper}
            >
              <View style={styles.flashSaleHeader}>
                <View style={styles.flashSaleLeft}>
                  <Text style={styles.flashSaleTitle}>⚡ Flash Sale</Text>
                  {renderFlashSaleTimer()}
                </View>
                <TouchableOpacity onPress={() => setShowFlashSale(false)}>
                  <Ionicons
                    name="close-outline"
                    size={moderateScale(20)}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>

              <FlatList
                data={products.slice(0, 10)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.flashSaleList}
                renderItem={renderFlashSaleItem}
              />
            </Animated.View>
          )}

          {/* ============================================== */}
          {/* 🏆 LOYALTY PROGRAM */}
          {/* ============================================== */}
          <Animated.View
            entering={FadeInUp.delay(250).duration(500)}
            style={styles.loyaltyCard}
          >
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={handleLoyaltyRedeem}
            >
              <LinearGradient
                colors={["#1B5E20", "#2E7D32", "#388E3C"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loyaltyGradient}
              >
                <View style={styles.loyaltyContent}>
                  <View style={styles.loyaltyLeft}>
                    <View style={styles.loyaltyHeader}>
                      <Text style={styles.loyaltyTitle}>🌟 Brownie Points</Text>
                      <View style={styles.loyaltyTierBadge}>
                        <Text style={styles.loyaltyTierText}>
                          {loyaltyData.tier}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.loyaltyPoints}>
                      {loyaltyData.points} pts
                    </Text>
                    <View style={styles.tierProgress}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${loyaltyData.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.tierText}>
                        Next: {loyaltyData.nextTier} Tier
                      </Text>
                    </View>
                  </View>
                  <View style={styles.redeemBtn}>
                    <Text style={styles.redeemBtnText}>Redeem</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ============================================== */}
          {/* 🌿 TRENDING PRODUCTS */}
          {/* ============================================== */}
          {products && products.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <View>
                  <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
                  <Text style={styles.sectionSubtitle}>
                    Most popular this week
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => goToShop()}
                  activeOpacity={0.7}
                >
                  <Text style={styles.viewAll}>View All →</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={products.slice(0, 10)}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.trendingList}
                renderItem={renderTrendingItem}
              />
            </>
          )}

          {/* ============================================== */}
          {/* 🌱 ECO HIGHLIGHTS */}
          {/* ============================================== */}
          <View style={styles.highlightGrid}>
            {highlights.map((item, index) => (
              <Animated.View
                key={item.title}
                entering={FadeInUp.delay(index * 60 + 400).duration(450)}
                style={styles.highlightCardWrapper}
              >
                <TouchableOpacity
                  style={styles.highlightCard}
                  onPress={() => handleHighlightPress(item)}
                >
                  <View
                    style={[
                      styles.highlightIconWrap,
                      { backgroundColor: item.color + "15" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={moderateScale(22)}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.highlightText}>{item.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ============================================== */}
          {/* 🛍️ FEATURED PRODUCTS */}
          {/* ============================================== */}
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>✨ Featured Products</Text>
              <Text style={styles.sectionSubtitle}>
                Handpicked just for you
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProductListing", {
                  categorySlug: "all",
                  categoryName: "All Products",
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <View style={styles.productGrid}>
              {featured?.slice(0, 4).map((product, index) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                  onPress={() => goToProductDetails(product)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </View>
          )}

          {/* ============================================== */}
          {/* 🌍 BIG PROMO */}
          {/* ============================================== */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.bigPromo}
          >
            <TouchableOpacity activeOpacity={0.95} onPress={() => goToShop()}>
              <LinearGradient
                colors={["#1A1A1A", "#2D2D2D", "#1A1A1A"]}
                style={styles.promoGradient}
              >
                <View style={styles.promoIcon}>
                  <Ionicons
                    name="leaf-outline"
                    size={moderateScale(40)}
                    color="#81C784"
                  />
                </View>
                <Text style={styles.promoSmall}>🌍 SUSTAINABLE CHOICE</Text>
                <Text style={styles.promoTitle}>Carbon Neutral Delivery</Text>
                <Text style={styles.promoText}>
                  Every order supports cleaner living, less plastic, and a
                  greener planet. Join the movement today!
                </Text>
                <View style={styles.promoBtn}>
                  <Text style={styles.promoBtnText}>Explore Products</Text>
                  <Ionicons
                    name="arrow-forward-circle-outline"
                    size={moderateScale(20)}
                    color="#1A1A1A"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ============================================== */}
          {/* 📸 GALLERY */}
          {/* ============================================== */}
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>📸 Eco Inspiration</Text>
              <Text style={styles.sectionSubtitle}>
                Ideas for your sustainable home
              </Text>
            </View>
            <TouchableOpacity onPress={() => goToShop()}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.galleryGrid}>
            {[
              { title: "Indoor Plants", color: "#2E7D32", category: "plants" },
              { title: "Eco Kitchen", color: "#4E342E", category: "kitchen" },
              {
                title: "Sustainable Gifts",
                color: "#C62828",
                category: "gifts",
              },
              { title: "Home Decor", color: "#0D47A1", category: "home-decor" },
            ].map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeInUp.delay(index * 80 + 600).duration(400)}
                style={styles.galleryItemWrapper}
              >
                <TouchableOpacity
                  style={[
                    styles.galleryItem,
                    { backgroundColor: item.color + "15" },
                  ]}
                  onPress={() => goToShop(item.category)}
                >
                  <Image
                    source={{
                      uri: `https://images.unsplash.com/photo-${["1542601906990-b4d3fb778b09", "1575320181282-9afab399332c", "1549465220-1a8b2758f8df", "1523741543316-beb7fc7023d8"][index] || "1542601906990-b4d3fb778b09"}?w=400`,
                    }}
                    style={styles.galleryImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.6)"]}
                    style={styles.galleryOverlay}
                  />
                  <View style={styles.galleryCaptionContainer}>
                    <Text style={styles.galleryCaption}>{item.title}</Text>
                    <Text style={styles.gallerySubCaption}>Explore →</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ============================================== */}
          {/* 📝 BLOGS */}
          {/* ============================================== */}
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>📖 Latest Blogs</Text>
              <Text style={styles.sectionSubtitle}>
                Sustainable living tips
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("Blogs", "View all blogs")}
            >
              <Text style={styles.viewAll}>Read All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.blogList}>
            {blogs.map((blog, index) => (
              <Animated.View
                key={blog.id}
                entering={FadeInUp.delay(index * 80 + 700).duration(450)}
              >
                <TouchableOpacity
                  style={styles.blogCard}
                  onPress={() => handleBlogPress(blog)}
                >
                  <View
                    style={[
                      styles.blogImageWrap,
                      { backgroundColor: "#E8F5E9" },
                    ]}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={moderateScale(24)}
                      color="#2E7D32"
                    />
                  </View>
                  <View style={styles.blogContent}>
                    <Text style={styles.blogTitle}>{blog.title}</Text>
                    <View style={styles.blogMeta}>
                      <Text style={styles.blogDate}>{blog.date}</Text>
                      <Text style={styles.blogReadTime}>
                        {blog.readTime} read
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.blogArrow}>
                    <Ionicons
                      name="arrow-forward"
                      size={moderateScale(18)}
                      color="#2E7D32"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* ============================================== */}
          {/* 📧 NEWSLETTER */}
          {/* ============================================== */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(500)}
            style={styles.newsletter}
          >
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.newsletterGradient}
            >
              <Text style={styles.newsTitle}>🌿 Stay Updated</Text>
              <Text style={styles.newsText}>
                Get eco tips, offers and latest product updates delivered to
                your inbox.
              </Text>
              <View style={styles.emailBox}>
                <TextInput
                  placeholder="Enter your email address"
                  placeholderTextColor="#999"
                  style={styles.emailInput}
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.subscribeBtn}
                  activeOpacity={0.8}
                  onPress={handleNewsletterSubscribe}
                >
                  <Text style={styles.subscribeText}>Subscribe</Text>
                  <Ionicons
                    name="send-outline"
                    size={moderateScale(16)}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ============================================== */}
          {/* 📱 FOOTER */}
          {/* ============================================== */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🌱 Made with love for a greener planet
            </Text>
            <View style={styles.socialRow}>
              {socialLinks.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.socialIcon}
                  onPress={() => openSocialLink(item.url)}
                >
                  <Ionicons
                    name={item.icon}
                    size={moderateScale(20)}
                    color="#666"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.footerCopyright}>
              © 2026 Green Fibre - All rights reserved
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() => navigation.navigate("PrivacyPolicy")}
              >
                <Text style={styles.footerLink}>Privacy</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Terms")}>
                <Text style={styles.footerLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.footerDot}>•</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Contact")}>
                <Text style={styles.footerLink}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.ScrollView>

        {/* ============================================== */}
        {/* 🔍 SEARCH MODAL */}
        {/* ============================================== */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowSearchModal(false);
            setSearchQuery("");
            setSearchResults([]);
          }}
        >
          <View style={styles.searchModalContainer}>
            <View
              style={[
                styles.searchModalContent,
                { paddingTop: insets.top + 20 },
              ]}
            >
              {/* Search Header */}
              <View style={styles.searchModalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowSearchModal(false);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="arrow-back"
                    size={moderateScale(24)}
                    color="#1A1A1A"
                  />
                </TouchableOpacity>

                <TextInput
                  ref={searchInputRef}
                  placeholder="Search for products..."
                  placeholderTextColor="#999"
                  style={styles.searchModalInput}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />

                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      searchInputRef.current?.focus();
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close-circle"
                      size={moderateScale(20)}
                      color="#999"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Search Results */}
              {searchQuery.length > 0 && (
                <View style={styles.searchResultsContainer}>
                  {isSearching ? (
                    <View style={styles.searchLoading}>
                      <ActivityIndicator size="large" color="#2E7D32" />
                      <Text style={styles.searchLoadingText}>Searching...</Text>
                    </View>
                  ) : searchResults.length > 0 ? (
                    <>
                      <View style={styles.searchResultsHeader}>
                        <Text style={styles.searchResultsTitle}>
                          {searchResults.length} Results Found
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setShowSearchModal(false);
                            setSearchQuery("");
                            setSearchResults([]);
                            navigation.navigate("Tabs", {
                              screen: "Shop",
                              params: { searchQuery: searchQuery.trim() },
                            });
                          }}
                        >
                          <Text style={styles.searchViewAll}>View All →</Text>
                        </TouchableOpacity>
                      </View>

                      <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id || item._id}
                        showsVerticalScrollIndicator={true}
                        renderItem={renderSearchResultItem}
                        contentContainerStyle={styles.searchResultsList}
                        keyboardShouldPersistTaps="handled"
                      />
                    </>
                  ) : (
                    <View style={styles.searchEmpty}>
                      <Ionicons
                        name="search-outline"
                        size={moderateScale(48)}
                        color="#CCC"
                      />
                      <Text style={styles.searchEmptyText}>
                        No products found
                      </Text>
                      <Text style={styles.searchEmptySub}>
                        Try searching with different keywords
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Trending Searches */}
              {searchQuery.length === 0 && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.searchTrendingScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.searchTrending}>
                    <Text style={styles.searchTrendingTitle}>
                      🔥 Trending Searches
                    </Text>
                    <View style={styles.searchTags}>
                      {[
                        { name: "Bamboo", icon: "leaf-outline" },
                        { name: "Plants", icon: "flower-outline" },
                        { name: "Eco Bags", icon: "bag-outline" },
                        { name: "Kitchen Set", icon: "restaurant-outline" },
                        { name: "Decor", icon: "home-outline" },
                        { name: "Garden", icon: "sunny-outline" },
                      ].map((tag, i) => (
                        <TouchableOpacity
                          key={i}
                          style={styles.searchTag}
                          activeOpacity={0.7}
                          onPress={() => {
                            setSearchQuery(tag.name);
                            handleSearch(tag.name);
                          }}
                        >
                          <Ionicons
                            name={tag.icon}
                            size={moderateScale(14)}
                            color="#2E7D32"
                          />
                          <Text style={styles.searchTagText}>{tag.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.searchCategories}>
                      <Text style={styles.searchTrendingTitle}>
                        🏷️ Browse Categories
                      </Text>
                      <View style={styles.searchTags}>
                        {categoryUiList.slice(0, 6).map((cat, i) => (
                          <TouchableOpacity
                            key={i}
                            style={[styles.searchTag, styles.searchCategoryTag]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setShowSearchModal(false);
                              setSearchQuery("");
                              setSearchResults([]);
                              handleCategoryPress(cat);
                            }}
                          >
                            <Ionicons
                              name={cat.icon}
                              size={moderateScale(14)}
                              color={cat.color}
                            />
                            <Text
                              style={[
                                styles.searchTagText,
                                { color: cat.color },
                              ]}
                            >
                              {cat.title}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Recent Searches */}
                    <View style={styles.searchRecent}>
                      <View style={styles.searchRecentHeader}>
                        <Text style={styles.searchTrendingTitle}>
                          🕐 Recent Searches
                        </Text>
                        <TouchableOpacity>
                          <Text style={styles.searchClearText}>Clear All</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.searchTags}>
                        {["Eco Planter", "Bamboo Set", "Garden Tools"].map(
                          (item, i) => (
                            <TouchableOpacity
                              key={i}
                              style={[styles.searchTag, styles.searchRecentTag]}
                              activeOpacity={0.7}
                              onPress={() => {
                                setSearchQuery(item);
                                handleSearch(item);
                              }}
                            >
                              <Ionicons
                                name="time-outline"
                                size={moderateScale(14)}
                                color="#666"
                              />
                              <Text
                                style={[
                                  styles.searchTagText,
                                  { color: "#666" },
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </View>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenContainer>
  );
}

// ============================================================
// 🎨 STYLES - Mobile Optimized
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingBottom: 20,
  },

  // ===== TOP BAR =====
  topBar: {
    paddingHorizontal: moderateScale(16),
    paddingTop: Platform.OS === "ios" ? 0 : moderateScale(8),
    paddingBottom: moderateScale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  iconBtn: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtn: {
    marginLeft: moderateScale(8),
  },
  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: moderateScale(18),
    height: moderateScale(18),
    borderRadius: moderateScale(9),
    backgroundColor: "#2E7D32",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  greetingContainer: {
    flex: 1,
    marginLeft: 0,
  },
  greetingText: {
    fontSize: moderateScale(16),
    fontWeight: "900",
    color: "#1A1A1A",
  },
  greetingSub: {
    fontSize: moderateScale(11),
    color: "#888",
    fontWeight: "500",
  },

  // ===== MEGA BANNER =====
  megaBannerWrapper: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  megaBanner: {
    height: screenWidth * 0.6,
    maxHeight: 260,
    borderRadius: moderateScale(24),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  megaBannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  megaBannerOverlay: {
    flex: 1,
    padding: moderateScale(20),
    justifyContent: "center",
  },
  megaBannerContent: {
    flex: 1,
    justifyContent: "center",
  },
  discountBadge: {
    backgroundColor: "#FFD700",
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(20),
    marginBottom: moderateScale(8),
  },
  discountText: {
    fontSize: moderateScale(12),
    fontWeight: "900",
    color: "#1A1A1A",
  },
  megaBannerTitle: {
    fontSize: moderateScale(20),
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: moderateScale(4),
  },
  megaBannerSubtitle: {
    fontSize: moderateScale(12),
    color: "#E0E0E0",
    marginBottom: moderateScale(12),
  },
  megaBannerBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(14),
    gap: moderateScale(8),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  megaBannerBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(13),
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: moderateScale(12),
    gap: moderateScale(6),
  },
  bannerDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#DDD",
  },
  bannerDotActive: {
    width: moderateScale(24),
    backgroundColor: "#2E7D32",
  },

  // ===== FINDER =====
  finderWrapper: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  finderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: moderateScale(14),
    paddingHorizontal: moderateScale(4),
  },
  finderTitle: {
    fontSize: moderateScale(18),
    fontWeight: "900",
    color: "#1A1A1A",
  },
  finderSubtitle: {
    fontSize: moderateScale(12),
    color: "#888",
    fontWeight: "500",
    marginTop: moderateScale(2),
  },
  finderSeeAll: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#2E7D32",
  },
  categoryList: {
    gap: moderateScale(12),
    paddingBottom: moderateScale(4),
  },
  categoryCard: {
    width: moderateScale(100),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  categoryCardSelected: {
    borderColor: "#2E7D32",
    borderWidth: 2,
  },
  categoryIcon: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(16),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(8),
  },
  categoryText: {
    fontSize: moderateScale(12),
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
  },
  categorySubtext: {
    fontSize: moderateScale(9),
    color: "#888",
    fontWeight: "600",
    marginTop: moderateScale(2),
  },
  categoryCount: {
    position: "absolute",
    top: moderateScale(8),
    right: moderateScale(8),
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
  },
  categoryCountText: {
    fontSize: moderateScale(8),
    fontWeight: "700",
    color: "#666",
  },

  // ===== FLASH SALE =====
  flashSaleWrapper: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  flashSaleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(12),
  },
  flashSaleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    flexWrap: "wrap",
  },
  flashSaleTitle: {
    fontSize: moderateScale(16),
    fontWeight: "900",
    color: "#E65100",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  timerLabel: {
    fontSize: moderateScale(10),
    fontWeight: "600",
    color: "#666",
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
  },
  timerText: {
    fontSize: moderateScale(12),
    fontWeight: "900",
    color: "#FFFFFF",
    minWidth: moderateScale(18),
    textAlign: "center",
  },
  timerColon: {
    fontSize: moderateScale(12),
    fontWeight: "900",
    color: "#FFFFFF",
  },
  flashSaleList: {
    gap: moderateScale(12),
    paddingBottom: moderateScale(4),
  },
  flashSaleCard: {
    width: moderateScale(140),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(10),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  flashSaleImage: {
    width: "100%",
    height: moderateScale(100),
    borderRadius: moderateScale(12),
    backgroundColor: "#F5F5F5",
  },
  flashSaleName: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: moderateScale(6),
    marginRight: moderateScale(24),
  },
  flashSalePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    marginTop: moderateScale(2),
  },
  flashSalePrice: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: "#E65100",
  },
  flashSaleCartBtn: {
    position: "absolute",
    bottom: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: "#2E7D32",
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },

  // ===== LOYALTY =====
  loyaltyCard: {
    paddingHorizontal: moderateScale(16),
    marginBottom: moderateScale(12),
  },
  loyaltyGradient: {
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loyaltyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loyaltyLeft: {
    flex: 1,
  },
  loyaltyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    flexWrap: "wrap",
  },
  loyaltyTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    fontWeight: "600",
    opacity: 0.9,
  },
  loyaltyTierBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(8),
  },
  loyaltyTierText: {
    fontSize: moderateScale(9),
    fontWeight: "900",
    color: "#1A1A1A",
  },
  loyaltyPoints: {
    color: "#FFFFFF",
    fontSize: moderateScale(24),
    fontWeight: "900",
    marginTop: moderateScale(2),
  },
  tierProgress: {
    marginTop: moderateScale(8),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(10),
  },
  progressBar: {
    flex: 1,
    height: moderateScale(4),
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: moderateScale(2),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: moderateScale(2),
  },
  tierText: {
    color: "#FFD700",
    fontSize: moderateScale(10),
    fontWeight: "700",
  },
  redeemBtn: {
    backgroundColor: "#FFD700",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(12),
    marginLeft: moderateScale(12),
  },
  redeemBtnText: {
    color: "#1A1A1A",
    fontSize: moderateScale(13),
    fontWeight: "900",
  },

  // ===== TRENDING =====
  trendingList: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(14),
    paddingBottom: moderateScale(12),
  },
  trendingCard: {
    width: moderateScale(160),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingImage: {
    width: "100%",
    height: moderateScale(130),
    borderRadius: moderateScale(16),
    backgroundColor: "#F5F5F5",
  },
  trendingTag: {
    position: "absolute",
    top: moderateScale(18),
    left: moderateScale(18),
    backgroundColor: "rgba(46,125,50,0.9)",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(8),
  },
  trendingTagText: {
    fontSize: moderateScale(9),
    fontWeight: "800",
    color: "#FFFFFF",
  },
  trendingHeart: {
    position: "absolute",
    top: moderateScale(18),
    right: moderateScale(18),
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  trendingInfo: {
    marginTop: moderateScale(10),
  },
  trendingName: {
    fontSize: moderateScale(13),
    fontWeight: "800",
    color: "#1A1A1A",
  },
  trendingRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
    marginTop: moderateScale(2),
  },
  trendingRatingText: {
    fontSize: moderateScale(12),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  trendingReviews: {
    fontSize: moderateScale(10),
    color: "#999",
    fontWeight: "500",
  },
  trendingBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(4),
  },
  trendingPrice: {
    fontSize: moderateScale(14),
    fontWeight: "900",
    color: "#2E7D32",
  },
  trendingAddCart: {
    backgroundColor: "#2E7D32",
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },

  // ===== SECTION ROW =====
  sectionRow: {
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(20),
    marginBottom: moderateScale(14),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: moderateScale(20),
    fontWeight: "900",
    color: "#1A1A1A",
  },
  sectionSubtitle: {
    fontSize: moderateScale(12),
    color: "#888",
    fontWeight: "500",
    marginTop: moderateScale(2),
  },
  viewAll: {
    fontSize: moderateScale(13),
    fontWeight: "800",
    color: "#2E7D32",
  },

  // ===== PRODUCT GRID =====
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(16),
  },

  // ===== HIGHLIGHTS =====
  highlightGrid: {
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(12),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: moderateScale(12),
  },
  highlightCardWrapper: {
    width: "30%",
    minWidth: moderateScale(90),
  },
  highlightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightIconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(6),
  },
  highlightText: {
    fontSize: moderateScale(10),
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },

  // ===== BIG PROMO =====
  bigPromo: {
    margin: moderateScale(16),
    borderRadius: moderateScale(24),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoGradient: {
    padding: moderateScale(24),
    alignItems: "center",
  },
  promoIcon: {
    marginBottom: moderateScale(12),
  },
  promoSmall: {
    color: "#81C784",
    fontSize: moderateScale(11),
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  promoTitle: {
    color: "#FFFFFF",
    marginTop: moderateScale(6),
    fontSize: moderateScale(22),
    fontWeight: "900",
    textAlign: "center",
  },
  promoText: {
    color: "#B0B0B0",
    marginTop: moderateScale(8),
    lineHeight: moderateScale(22),
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  promoBtn: {
    marginTop: moderateScale(20),
    backgroundColor: "#FFFFFF",
    paddingHorizontal: moderateScale(22),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(14),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoBtnText: {
    color: "#1A1A1A",
    fontWeight: "900",
    fontSize: moderateScale(13),
  },

  // ===== GALLERY =====
  galleryGrid: {
    paddingHorizontal: moderateScale(16),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  galleryItemWrapper: {
    width: (screenWidth - moderateScale(32) - moderateScale(12)) / 2,
    maxWidth: moderateScale(200),
    marginBottom: moderateScale(12),
  },
  galleryItem: {
    width: "100%",
    height: moderateScale(150),
    borderRadius: moderateScale(20),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  galleryCaptionContainer: {
    position: "absolute",
    bottom: moderateScale(12),
    left: moderateScale(12),
    right: moderateScale(12),
  },
  galleryCaption: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "800",
  },
  gallerySubCaption: {
    color: "rgba(255,255,255,0.7)",
    fontSize: moderateScale(11),
    fontWeight: "600",
    marginTop: moderateScale(2),
  },

  // ===== BLOGS =====
  blogList: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
  },
  blogCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  blogImageWrap: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  blogContent: {
    flex: 1,
  },
  blogTitle: {
    fontSize: moderateScale(14),
    fontWeight: "800",
    color: "#1A1A1A",
  },
  blogMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    marginTop: moderateScale(4),
  },
  blogDate: {
    fontSize: moderateScale(11),
    color: "#999",
    fontWeight: "500",
  },
  blogReadTime: {
    fontSize: moderateScale(11),
    color: "#999",
    fontWeight: "500",
  },
  blogArrow: {
    padding: moderateScale(4),
  },

  // ===== NEWSLETTER =====
  newsletter: {
    margin: moderateScale(16),
    borderRadius: moderateScale(24),
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newsletterGradient: {
    padding: moderateScale(22),
  },
  newsTitle: {
    fontSize: moderateScale(22),
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
  },
  newsText: {
    marginTop: moderateScale(8),
    color: "#555",
    textAlign: "center",
    lineHeight: moderateScale(20),
    fontSize: moderateScale(14),
  },
  emailBox: {
    marginTop: moderateScale(16),
    backgroundColor: "#FFFFFF",
    borderRadius: moderateScale(16),
    padding: moderateScale(4),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexWrap: "wrap",
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: moderateScale(14),
    color: "#1A1A1A",
    fontSize: moderateScale(14),
    height: moderateScale(48),
    minWidth: moderateScale(120),
  },
  subscribeBtn: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(12),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
  },
  subscribeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: moderateScale(13),
  },

  // ===== FOOTER =====
  footer: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(24),
    paddingBottom: moderateScale(12),
    alignItems: "center",
  },
  footerText: {
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "600",
    marginBottom: moderateScale(12),
    textAlign: "center",
  },
  socialRow: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginBottom: moderateScale(12),
    flexWrap: "wrap",
    justifyContent: "center",
  },
  socialIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  footerCopyright: {
    fontSize: moderateScale(11),
    color: "#999",
    fontWeight: "500",
    marginBottom: moderateScale(8),
    textAlign: "center",
  },
  footerLinks: {
    flexDirection: "row",
    gap: moderateScale(12),
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerLink: {
    fontSize: moderateScale(11),
    color: "#888",
    fontWeight: "500",
  },
  footerDot: {
    fontSize: moderateScale(11),
    color: "#888",
  },

  // ===== SEARCH MODAL =====
  searchModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-start",
  },
  searchModalContent: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(30),
    minHeight: "70%",
    maxHeight: "92%",
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: moderateScale(12),
  },
  searchModalInput: {
    flex: 1,
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#1A1A1A",
    paddingVertical: moderateScale(4),
  },
  searchResultsContainer: {
    flex: 1,
    marginTop: moderateScale(16),
  },
  searchResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  searchResultsTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
  },
  searchViewAll: {
    fontSize: moderateScale(13),
    fontWeight: "700",
    color: "#2E7D32",
  },
  searchResultsList: {
    paddingBottom: moderateScale(20),
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: moderateScale(12),
  },
  searchResultImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(8),
    backgroundColor: "#F5F5F5",
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  searchResultPrice: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#2E7D32",
    marginTop: moderateScale(2),
  },
  searchResultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    marginTop: moderateScale(4),
  },
  searchResultRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(4),
  },
  searchResultRatingText: {
    fontSize: moderateScale(11),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  searchResultTag: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(1),
    borderRadius: moderateScale(4),
  },
  searchResultTagText: {
    fontSize: moderateScale(8),
    fontWeight: "600",
    color: "#E65100",
  },
  searchResultAdd: {
    padding: moderateScale(8),
  },
  searchLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchLoadingText: {
    marginTop: moderateScale(12),
    fontSize: moderateScale(14),
    color: "#666",
    fontWeight: "500",
  },
  searchEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(40),
  },
  searchEmptyText: {
    fontSize: moderateScale(18),
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: moderateScale(12),
  },
  searchEmptySub: {
    fontSize: moderateScale(14),
    color: "#999",
    marginTop: moderateScale(4),
  },
  searchTrendingScroll: {
    flex: 1,
    marginTop: moderateScale(16),
  },
  searchTrending: {
    paddingBottom: moderateScale(20),
  },
  searchTrendingTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: moderateScale(12),
  },
  searchTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(10),
  },
  searchTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(6),
    backgroundColor: "#F5F5F5",
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(20),
  },
  searchCategoryTag: {
    backgroundColor: "#F8F8F8",
  },
  searchTagText: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#1A1A1A",
  },
  searchCategories: {
    marginTop: moderateScale(20),
  },
  searchRecent: {
    marginTop: moderateScale(20),
  },
  searchRecentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  searchClearText: {
    fontSize: moderateScale(12),
    color: "#999",
    fontWeight: "500",
  },
  searchRecentTag: {
    backgroundColor: "#F0F0F0",
  },
});
