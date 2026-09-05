import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SectionHeader } from "../components/common/SectionHeader";
import { ProductCard } from "../components/common/ProductCard";
import { ProductGridSkeleton } from "../components/common/LoadingSkeleton";
import { ErrorState } from "../components/common/ErrorState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchProductsByCategory } from "../store/slices/productsSlice";

const { width } = Dimensions.get("window");

// FNP Brand Colors
const fnpColors = {
  primary: "#E91E63",
  primaryLight: "#FCE4EC",
  primaryDark: "#C2185B",
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

// Fallback shadows if not available
const shadowStyles = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};

// Sort options
const sortOptions = [
  { id: "popular", label: "Most Popular", icon: "trending-up-outline" },
  { id: "price_low", label: "Price: Low to High", icon: "arrow-up-outline" },
  { id: "price_high", label: "Price: High to Low", icon: "arrow-down-outline" },
  { id: "rating", label: "Top Rated", icon: "star-outline" },
  { id: "newest", label: "Newest First", icon: "time-outline" },
];

// Filter options
const filterOptions = [
  { id: "all", label: "All", icon: "apps-outline" },
  { id: "sustainable", label: "Sustainable", icon: "leaf-outline" },
  { id: "eco_friendly", label: "Eco Friendly", icon: "recycle-outline" },
  { id: "handmade", label: "Handmade", icon: "hammer-outline" },
  { id: "organic", label: "Organic", icon: "flower-outline" },
];

export function ProductListingScreen({ navigation, route }) {
  const { categorySlug = "all", categoryName = "All Products" } =
    route.params ?? {};
  const dispatch = useAppDispatch();
  const { products, loading, error } = useAppSelector((s) => s.products);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(fetchProductsByCategory({ categorySlug }));
  }, [dispatch, categorySlug]);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Filter by search
    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categorySlug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Legacy tag filters are not supported by the real backend.
    if (selectedFilter !== "all") {
      result = result.filter(
        (p) =>
          p.featuresList?.some((feature) =>
            String(feature).toLowerCase().includes(selectedFilter.replace(/_/g, " ")),
          ) || p.categoryName?.toLowerCase().includes(selectedFilter.replace(/_/g, " ")),
      );
    }

    // Sort
    switch (selectedSort) {
      case "popular":
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case "price_low":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_high":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        result.sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0));
        break;
      case "newest":
        result.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        break;
      default:
        break;
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedFilter, selectedSort]);

  // Entrance animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const renderProductItem = ({ item, index }) => {
    const isListMode = viewMode === "list";

    return (
      <Animated.View
        style={[
          isListMode ? styles.listItemWrapper : styles.gridItemWrapper,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ProductCard
          product={item}
          index={index}
          onPress={() =>
            navigation.navigate("ProductDetails", {
              productId: item._id,
            })
          }
          variant={isListMode ? "list" : "grid"}
        />
      </Animated.View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <LinearGradient
          colors={[fnpColors.primaryLight, "#F8BBD0"]}
          style={styles.emptyIconGradient}
        >
          <Ionicons name="search-outline" size={40} color={fnpColors.primary} />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptyMessage}>
        Try adjusting your search or filter to find what you're looking for.
      </Text>
      <TouchableOpacity
        style={styles.clearBtn}
        onPress={() => {
          setSearchQuery("");
          setSelectedFilter("all");
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.clearBtnText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  // Fallback text styles if typography is not available
  const textStyles = {
    body: styles.bodyText,
    bodySmall: styles.bodySmallText,
    h2: styles.h2Text,
    h3: styles.h3Text,
  };

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle={categoryName}
      headerRight={
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={toggleViewMode}
            activeOpacity={0.7}
          >
            <Ionicons
              name={viewMode === "grid" ? "list-outline" : "grid-outline"}
              size={20}
              color={fnpColors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setShowFilters(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color={fnpColors.text} />
            {(selectedFilter !== "all" || selectedSort !== "popular") && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
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
        </View>

        {/* Results count */}
        {!loading && !error && (
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"} found
            </Text>
            <TouchableOpacity
              style={styles.sortBtn}
              onPress={() => setShowFilters(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.sortBtnText}>
                {sortOptions.find((s) => s.id === selectedSort)?.label ||
                  "Sort"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={fnpColors.primary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        {error ? (
          <ErrorState
            message={error}
            onRetry={() => dispatch(fetchProductsByCategory({ categorySlug }))}
          />
        ) : loading ? (
          <ProductGridSkeleton count={6} />
        ) : filteredProducts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item._id}
            renderItem={renderProductItem}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode === "grid" ? "grid" : "list"}
            contentContainerStyle={[
              styles.productList,
              viewMode === "grid" && styles.gridList,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* ===== FILTER MODAL ===== */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowFilters(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={fnpColors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sort Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.filterOptions}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.filterOption,
                        selectedSort === option.id && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedSort(option.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={
                          selectedSort === option.id
                            ? fnpColors.primary
                            : fnpColors.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedSort === option.id &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selectedSort === option.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={fnpColors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Filter Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.filterOptions}>
                  {filterOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.filterOption,
                        selectedFilter === option.id &&
                          styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedFilter(option.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={
                          selectedFilter === option.id
                            ? fnpColors.primary
                            : fnpColors.textMuted
                        }
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilter === option.id &&
                            styles.filterOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {selectedFilter === option.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={fnpColors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilters(false)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[fnpColors.primary, fnpColors.primaryDark]}
                  style={styles.applyBtnGradient}
                >
                  <Text style={styles.applyBtnText}>Apply Filters</Text>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => {
                  setSelectedSort("popular");
                  setSelectedFilter("all");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

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
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: fnpColors.primary,
  },

  // ===== SEARCH =====
  searchWrapper: {
    paddingHorizontal: spacing.screen || 16,
    paddingTop: 16,
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
    ...shadowStyles.small,
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

  // ===== RESULTS =====
  resultsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.screen || 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: fnpColors.primaryLight,
    borderRadius: 20,
  },
  sortBtnText: {
    fontSize: 12,
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== PRODUCT LIST =====
  productList: {
    paddingHorizontal: spacing.screen || 16,
    paddingBottom: 20,
  },
  gridList: {
    paddingBottom: 20,
  },
  gridItemWrapper: {
    width: (width - (spacing.screen || 16) * 2 - 8) / 2,
    marginBottom: 16,
  },
  listItemWrapper: {
    width: "100%",
    marginBottom: 16,
  },

  // ===== EMPTY STATE =====
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
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
    fontSize: 22,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  clearBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: fnpColors.primary,
    borderRadius: 12,
  },
  clearBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // ===== MODAL =====
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: fnpColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "80%",
    ...shadowStyles.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: fnpColors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: fnpColors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },

  // ===== FILTER SECTIONS =====
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 15,
    color: fnpColors.text,
    fontWeight: "700",
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterOptionActive: {
    backgroundColor: fnpColors.primaryLight,
    borderColor: fnpColors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: fnpColors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  filterOptionTextActive: {
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== BUTTONS =====
  applyBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
    ...shadowStyles.medium,
  },
  applyBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  applyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resetBtn: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  resetBtnText: {
    fontSize: 14,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },

  // ===== FALLBACK TEXT STYLES =====
  bodyText: {
    fontSize: 14,
    color: fnpColors.text,
  },
  bodySmallText: {
    fontSize: 12,
    color: fnpColors.text,
  },
  h2Text: {
    fontSize: 20,
    fontWeight: "700",
    color: fnpColors.text,
  },
  h3Text: {
    fontSize: 16,
    fontWeight: "600",
    color: fnpColors.text,
  },
});
