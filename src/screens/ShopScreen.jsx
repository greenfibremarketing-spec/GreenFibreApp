// src/screens/ShopScreen.jsx
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import { useNavigation, useRoute, DrawerActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { ProductCard } from "../components/common/ProductCard";
import {
  ProductGridSkeleton,
  CategoryCarouselSkeleton,
} from "../components/common/LoadingSkeleton";
import { ErrorState } from "../components/common/ErrorState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchProducts,
  fetchProductsByCategory,
  setSelectedCategory,
} from "../store/slices/productsSlice";
import { fetchCategories } from "../store/slices/categoriesSlice";

const { width } = Dimensions.get("window");

// FNP Brand Colors
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#FFD700",
  goldLight: "#FFF8E1",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textMuted: "#999999",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#F44336",
  warning: "#FF9800",
  cream: "#FFF8F0",
};

// Category icons mapping
const categoryIcons = {
  all: "apps-outline",
  "kitchen-and-dining": "restaurant-outline",
  "kitchen-dining": "restaurant-outline",
  kitchen: "restaurant-outline",
  kitchenware: "restaurant-outline",
  dining: "cafe-outline",
  drinkware: "water-outline",
  bottles: "flask-outline",
  "home-and-living": "home-outline",
  "home-living": "home-outline",
  "home-decor": "easel-outline",
  decor: "easel-outline",
  "storage-and-baskets": "file-tray-full-outline",
  "storage-baskets": "file-tray-full-outline",
  storage: "cube-outline",
  baskets: "basket-outline",
  "pet-care": "paw-outline",
  pets: "paw-outline",
  plants: "leaf-outline",
  garden: "flower-outline",
  gifts: "gift-outline",
  lifestyle: "sparkles-outline",
  stationery: "book-outline",
  bags: "bag-handle-outline",
  apparel: "shirt-outline",
};

// Category colors mapping
const categoryColors = {
  all: fnpColors.primary,
  "kitchen-and-dining": "#D97706",
  "kitchen-dining": "#D97706",
  kitchen: "#D97706",
  kitchenware: "#D97706",
  dining: "#D97706",
  drinkware: "#0284C7",
  bottles: "#0284C7",
  "home-and-living": "#166534",
  "home-living": "#166534",
  "home-decor": "#4E342E",
  decor: "#4E342E",
  "storage-and-baskets": "#854D0E",
  "storage-baskets": "#854D0E",
  storage: "#854D0E",
  baskets: "#854D0E",
  "pet-care": "#EA580C",
  pets: "#EA580C",
  plants: "#2E7D32",
  garden: "#15803D",
  gifts: "#BE123C",
  lifestyle: "#7E22CE",
  stationery: "#0F766E",
  bags: "#9A3412",
  apparel: "#059669",
};

// Create Animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

// Resilient category slug resolver
const resolveCategorySlug = (inputSlug, availableCategories = []) => {
  if (!inputSlug || inputSlug === "all") return "all";
  const cleanInput = inputSlug.toLowerCase().replace(/_/g, "-").trim();

  // 1. Exact match by slug or id
  const exact = availableCategories.find(
    (c) =>
      (c.slug && c.slug.toLowerCase() === cleanInput) ||
      c._id === inputSlug ||
      c.id === inputSlug
  );
  if (exact) return exact.slug;

  // 2. Fuzzy match
  const fuzzy = availableCategories.find((c) => {
    const cSlug = (c.slug || "").toLowerCase();
    const cName = (c.name || "").toLowerCase();
    const cleanNoAnd = cleanInput.replace(/-and-/g, "-").replace(/&/g, "");
    const cSlugNoAnd = cSlug.replace(/-and-/g, "-").replace(/&/g, "");

    return (
      cSlug === cleanInput ||
      cSlugNoAnd === cleanNoAnd ||
      cSlug.includes(cleanInput) ||
      cleanInput.includes(cSlug) ||
      cName.includes(cleanInput) ||
      cleanInput.includes(cName)
    );
  });
  if (fuzzy) return fuzzy.slug;

  return cleanInput;
};

export function ShopScreen() {
  const stackNav = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { products, loading, error, selectedCategory } = useAppSelector(
    (s) => s.products
  );
  const { categories, loading: categoriesLoading } = useAppSelector(
    (s) => s.categories
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // On mount or route params change
  useEffect(() => {
    const rawCategory = route.params?.category;
    if (rawCategory && rawCategory !== "all") {
      const resolved = resolveCategorySlug(rawCategory, categories);
      dispatch(setSelectedCategory(resolved));
    } else if (!selectedCategory) {
      dispatch(setSelectedCategory("all"));
    }

    // Always ensure catalog data is fetched
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch, route.params?.category]);

  // If categories finish loading, re-check category slug resolution
  useEffect(() => {
    const rawCategory = route.params?.category;
    if (rawCategory && rawCategory !== "all" && categories.length > 0) {
      const resolved = resolveCategorySlug(rawCategory, categories);
      if (resolved !== selectedCategory) {
        dispatch(setSelectedCategory(resolved));
      }
    }
  }, [categories, route.params?.category, selectedCategory, dispatch]);

  useEffect(() => {
    const q = route.params?.search || route.params?.searchQuery;
    if (q) {
      setSearchQuery(q);
      setShowSearch(true);
    }
  }, [route.params?.search, route.params?.searchQuery]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([dispatch(fetchProducts()), dispatch(fetchCategories())]);
    setRefreshing(false);
  }, [dispatch]);

  const categoryOptions = useMemo(() => {
    return [
      { id: "all", slug: "all", name: "All" },
      ...categories.map((category) => ({
        id: category.slug || category._id,
        slug: category.slug,
        name: category.name,
      })),
    ];
  }, [categories]);

  // Robust product filtering
  const displayedProducts = useMemo(() => {
    const activeCat = selectedCategory || "all";
    const cleanSearch = searchQuery.trim().toLowerCase();

    return (products || []).filter((p) => {
      const catSlug = (p.categorySlug || p.category?.slug || "").toLowerCase();
      const catId = p.category?._id || p.category?.id || p.category || "";
      const catName = (p.categoryName || p.category?.name || "").toLowerCase();

      const matchesCategory =
        activeCat === "all" ||
        catSlug === activeCat ||
        catId === activeCat ||
        catName === activeCat ||
        catSlug.replace(/-and-/g, "-") === activeCat.replace(/-and-/g, "-") ||
        (catSlug && activeCat.includes(catSlug)) ||
        (activeCat && catSlug.includes(activeCat)) ||
        (catName && catName.includes(activeCat)) ||
        (activeCat && activeCat.includes(catName));

      const matchesSearch = cleanSearch
        ? (p.name || "").toLowerCase().includes(cleanSearch) ||
          catName.includes(cleanSearch) ||
          (p.description || "").toLowerCase().includes(cleanSearch)
        : true;

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCategory = (slug) => {
    dispatch(setSelectedCategory(slug));
  };

  const getCategoryIcon = (slug, name) => {
    const s = (slug || "").toLowerCase().trim();
    const n = (name || "").toLowerCase().trim();
    if (categoryIcons[s]) return categoryIcons[s];
    if (categoryIcons[s.replace(/_/g, "-")]) return categoryIcons[s.replace(/_/g, "-")];

    if (s.includes("kitchen") || n.includes("kitchen") || n.includes("dining")) return "restaurant-outline";
    if (s.includes("drink") || n.includes("drink") || s.includes("bottle") || n.includes("bottle")) return "water-outline";
    if (s.includes("home") || n.includes("home") || s.includes("living") || n.includes("living")) return "home-outline";
    if (s.includes("storage") || n.includes("storage") || s.includes("basket") || n.includes("basket")) return "file-tray-full-outline";
    if (s.includes("pet") || n.includes("pet") || n.includes("dog") || n.includes("cat")) return "paw-outline";
    if (s.includes("plant") || n.includes("plant")) return "leaf-outline";
    if (s.includes("gift") || n.includes("gift")) return "gift-outline";
    if (s.includes("garden") || n.includes("garden")) return "flower-outline";
    if (s.includes("bag") || n.includes("bag")) return "bag-handle-outline";
    if (s.includes("station") || n.includes("station")) return "book-outline";

    return s === "all" ? "apps-outline" : "leaf-outline";
  };

  const getCategoryColor = (slug, name) => {
    const s = (slug || "").toLowerCase().trim();
    const n = (name || "").toLowerCase().trim();
    if (categoryColors[s]) return categoryColors[s];
    if (categoryColors[s.replace(/_/g, "-")]) return categoryColors[s.replace(/_/g, "-")];

    if (s.includes("kitchen") || n.includes("kitchen") || n.includes("dining")) return "#D97706";
    if (s.includes("drink") || n.includes("drink") || s.includes("bottle") || n.includes("bottle")) return "#0284C7";
    if (s.includes("home") || n.includes("home") || s.includes("living") || n.includes("living")) return "#166534";
    if (s.includes("storage") || n.includes("storage") || s.includes("basket") || n.includes("basket")) return "#854D0E";
    if (s.includes("pet") || n.includes("pet") || n.includes("dog") || n.includes("cat")) return "#EA580C";
    if (s.includes("plant") || n.includes("plant")) return "#2E7D32";
    if (s.includes("gift") || n.includes("gift")) return "#BE123C";
    if (s.includes("garden") || n.includes("garden")) return "#15803D";
    if (s.includes("bag") || n.includes("bag")) return "#9A3412";
    if (s.includes("station") || n.includes("station")) return "#0F766E";

    return fnpColors.primary;
  };

  // Render category chip with icon
  const renderCategoryChip = (cat) => {
    const isActive =
      selectedCategory === cat.slug ||
      (selectedCategory === "all" && cat.slug === "all");
    const iconName = getCategoryIcon(cat.slug, cat.name);
    const color = getCategoryColor(cat.slug, cat.name);

    return (
      <TouchableOpacity
        key={cat.id}
        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
        onPress={() => handleCategory(cat.slug)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.categoryIconWrap,
            isActive && styles.categoryIconWrapActive,
            { backgroundColor: isActive ? fnpColors.white : color + "15" },
          ]}
        >
          <Ionicons
            name={iconName}
            size={16}
            color={isActive ? color : color}
          />
        </View>
        <Text
          style={[styles.categoryText, isActive && styles.categoryTextActive]}
        >
          {cat.name}
        </Text>
        {isActive && <View style={styles.categoryActiveIndicator} />}
      </TouchableOpacity>
    );
  };

  // Render product item
  const renderProductItem = ({ item, index }) => (
    <ProductCard
      product={item}
      index={index}
      variant={viewMode === "grid" ? "default" : "horizontal"}
      onPress={() =>
        stackNav.navigate("ProductDetails", { productId: item._id, product: item })
      }
    />
  );

  // Render categories header component
  const renderCategoriesHeader = () => (
    <>
      {/* Search Bar */}
      {showSearch && (
        <Animated.View style={styles.searchWrapper}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              size={20}
              color={fnpColors.textMuted}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={fnpColors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearchQuery("")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={fnpColors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {/* Category Section */}
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Categories</Text>
          <Text style={styles.categoryCount}>
            {displayedProducts.length} products
          </Text>
        </View>

        {categoriesLoading && categories.length === 0 ? (
          <CategoryCarouselSkeleton count={5} />
        ) : (
          <FlatList
            data={categoryOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => renderCategoryChip(item)}
          />
        )}
      </View>
    </>
  );

  if (error && products.length === 0) {
    return (
      <ScreenContainer onMenuPress={() => stackNav.dispatch(DrawerActions.openDrawer())}>
        <ErrorState message={error} onRetry={() => dispatch(fetchProducts())} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      onMenuPress={() => stackNav.dispatch(DrawerActions.openDrawer())}
      headerTitle="Shop"
      scroll={false}
      headerRight={
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showSearch ? "close-outline" : "search-outline"}
              size={22}
              color={fnpColors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={viewMode === "grid" ? "list-outline" : "grid-outline"}
              size={22}
              color={fnpColors.text}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.container}>
        <AnimatedFlatList
          data={loading && products.length === 0 ? [] : displayedProducts}
          keyExtractor={(item) => item._id || item.id || String(Math.random())}
          renderItem={renderProductItem}
          numColumns={viewMode === "grid" ? 2 : 1}
          key={viewMode === "grid" ? "grid" : "list"}
          columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
          contentContainerStyle={[
            styles.productGrid,
            viewMode === "grid" && styles.gridList,
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[fnpColors.primary]}
              tintColor={fnpColors.primary}
            />
          }
          ListHeaderComponent={renderCategoriesHeader()}
          ListEmptyComponent={
            loading ? (
              <ProductGridSkeleton count={6} padding={false} />
            ) : (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIconWrap}>
                  <LinearGradient
                    colors={[fnpColors.primaryLight, "#C8E6C9"]}
                    style={styles.emptyIconGradient}
                  >
                    <Ionicons
                      name="leaf-outline"
                      size={40}
                      color={fnpColors.primary}
                    />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>No Products Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? `No results found for "${searchQuery}"`
                    : "No products available in this category yet"}
                </Text>
                {(searchQuery || selectedCategory !== "all") && (
                  <TouchableOpacity
                    style={styles.clearFiltersBtn}
                    onPress={() => {
                      setSearchQuery("");
                      dispatch(setSelectedCategory("all"));
                      dispatch(fetchProducts());
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            )
          }
          ListFooterComponent={<View style={styles.footerSpacer} />}
        />
      </View>
    </ScreenContainer>
  );
}

export default ShopScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fnpColors.cream,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== SEARCH =====
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: fnpColors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 15,
    color: fnpColors.text,
  },
  clearSearchBtn: {
    padding: 4,
  },

  // ===== CATEGORIES =====
  categorySection: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.text,
  },
  categoryCount: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: fnpColors.white,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  categoryChipActive: {
    backgroundColor: fnpColors.primary,
    borderColor: fnpColors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconWrapActive: {
    backgroundColor: fnpColors.white,
  },
  categoryText: {
    fontSize: 13,
    color: fnpColors.textSecondary,
    fontWeight: "500",
  },
  categoryTextActive: {
    color: fnpColors.white,
    fontWeight: "600",
  },
  categoryActiveIndicator: {
    position: "absolute",
    bottom: -2,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: fnpColors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // ===== PRODUCT GRID =====
  productGrid: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  gridList: {
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  // ===== EMPTY STATE =====
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    paddingTop: 60,
  },
  emptyIconWrap: {
    marginBottom: 16,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  clearFiltersBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: fnpColors.primary,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // ===== FOOTER =====
  footerSpacer: {
    height: 24,
  },
});
