import React, { useState, useRef } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedComponent, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { blogsContent } from "../data/content";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SectionHeader } from "../components/common/SectionHeader";
import { EmptyState } from "../components/common/EmptyState";
import { colors, spacing, typography, shadows } from "../theme";

const { width } = Dimensions.get("window");

// FNP Brand Colors
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#FFD700",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textMuted: "#999999",
  borderLight: "#E8E8E8",
  success: "#4CAF50",
  danger: "#F44336",
};

// Helper: calculate read time
const getReadTime = (content) => {
  const words = content?.split(/\s+/).length || 0;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? "< 1 min" : `${mins} min`;
};

// Helper: format date
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Category filter options
const categories = [
  { id: "all", label: "All" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "sustainability", label: "Sustainability" },
  { id: "gifts", label: "Gifts" },
  { id: "home", label: "Home" },
  { id: "garden", label: "Garden" },
];

export function BlogsScreen() {
  const navigation = useNavigation();
  const blogs = blogsContent.blogs || [];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [bookmarkedPosts, setBookmarkedPosts] = useState({});

  const scrollY = useRef(new Animated.Value(0)).current;

  // Filter blogs by category and search
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      selectedCategory === "all" ||
      blog.category?.toLowerCase() === selectedCategory;
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && (searchQuery ? matchesSearch : true);
  });

  // Handle like toggle
  const handleLike = (blogId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
  };

  // Handle bookmark toggle
  const handleBookmark = (blogId) => {
    setBookmarkedPosts((prev) => ({
      ...prev,
      [blogId]: !prev[blogId],
    }));
  };

  // Render category filter
  const renderCategoryFilter = () => (
    <View style={styles.categoryFilterWrapper}>
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoryFilterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === item.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(item.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === item.id && styles.categoryChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  // Render search bar
  const renderSearchBar = () => (
    <AnimatedComponent.View
      entering={FadeInDown.delay(100).duration(400)}
      style={styles.searchWrapper}
    >
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={fnpColors.textMuted} />
        <TextInput
          placeholder="Search articles..."
          placeholderTextColor={fnpColors.textMuted}
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsSearching(true)}
          onBlur={() => setIsSearching(false)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearBtn}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={fnpColors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedComponent.View>
  );

  // Render blog item
  const renderBlogItem = ({ item, index }) => {
    const isLiked = likedPosts[item.id] || false;
    const isBookmarked = bookmarkedPosts[item.id] || false;
    const readTime = getReadTime(item.content);
    const formattedDate = formatDate(item.date);

    return (
      <AnimatedComponent.View
        entering={FadeInUp.delay(index * 80 + 200).duration(500)}
        style={styles.blogCard}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("BlogDetails", { id: item.id })}
          style={styles.blogCardInner}
        >
          {/* Blog Image */}
          <Image
            source={{
              uri:
                item.image ||
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
            }}
            style={styles.blogImage}
            resizeMode="cover"
          />

          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {item.category || "Lifestyle"}
            </Text>
          </View>

          {/* Bookmark Button */}
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => handleBookmark(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={20}
              color={isBookmarked ? fnpColors.primary : fnpColors.white}
            />
          </TouchableOpacity>

          {/* Blog Content */}
          <View style={styles.blogContent}>
            <Text style={styles.blogTitle} numberOfLines={2}>
              {item.title}
            </Text>

            {item.subtitle && (
              <Text style={styles.blogSubtitle} numberOfLines={2}>
                {item.subtitle}
              </Text>
            )}

            <View style={styles.blogMeta}>
              <View style={styles.authorInfo}>
                <View style={styles.authorAvatarSmall}>
                  <Text style={styles.authorAvatarText}>
                    {item.author?.charAt(0)?.toUpperCase() || "A"}
                  </Text>
                </View>
                <Text style={styles.authorNameSmall}>
                  {item.author || "Unknown"}
                </Text>
              </View>
              <View style={styles.metaRight}>
                <View style={styles.readTimeBadge}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={fnpColors.textMuted}
                  />
                  <Text style={styles.readTimeText}>{readTime}</Text>
                </View>
                <Text style={styles.blogDate}>{formattedDate}</Text>
              </View>
            </View>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 3).map((tag, i) => (
                  <View key={i} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>#{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 3 && (
                  <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleLike(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={18}
                  color={isLiked ? fnpColors.danger : fnpColors.textMuted}
                />
                <Text
                  style={[
                    styles.actionBtnText,
                    isLiked && styles.actionBtnTextActive,
                  ]}
                >
                  {isLiked ? "Liked" : "Like"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  navigation.navigate("BlogDetails", { id: item.id })
                }
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color={fnpColors.textMuted}
                />
                <Text style={styles.actionBtnText}>Read More</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  // Share functionality
                  Alert.alert("Share", `Share "${item.title}"`);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={fnpColors.textMuted}
                />
                <Text style={styles.actionBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </AnimatedComponent.View>
    );
  };

  // Render header with stats
  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>
        📚 {blogsContent.title || "Our Blogs"}
      </Text>
      <Text style={styles.headerSubtitle}>
        {blogsContent.subtitle || "Discover stories, tips, and inspiration"}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{blogs.length}</Text>
          <Text style={styles.statLabel}>Articles</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {blogs.reduce((acc, blog) => acc + (blog.tags?.length || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Tags</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {
              Object.keys(bookmarkedPosts).filter((key) => bookmarkedPosts[key])
                .length
            }
          </Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="Blogs"
      headerRight={
        <TouchableOpacity
          onPress={() => setIsSearching(!isSearching)}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSearching ? "close-outline" : "search-outline"}
            size={22}
            color={fnpColors.text}
          />
        </TouchableOpacity>
      }
    >
      <AnimatedComponent.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* Header Section */}
        {renderHeader()}

        {/* Search Bar */}
        {isSearching && renderSearchBar()}

        {/* Category Filter */}
        {renderCategoryFilter()}

        {/* Blog List */}
        {filteredBlogs.length === 0 ? (
          <EmptyState
            icon="newspaper-outline"
            title="No Articles Found"
            message={
              searchQuery
                ? `No results found for "${searchQuery}"`
                : blogsContent.emptyMessage || "No articles available"
            }
            actionLabel={searchQuery ? "Clear Search" : "Browse All"}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery("");
                setSelectedCategory("all");
              }
            }}
          />
        ) : (
          <>
            {/* Results Count */}
            <View style={styles.resultCountContainer}>
              <Text style={styles.resultCount}>
                Showing {filteredBlogs.length}{" "}
                {filteredBlogs.length === 1 ? "article" : "articles"}
              </Text>
            </View>

            {/* Blog List */}
            <View style={styles.listContainer}>
              {filteredBlogs.map((item, index) => (
                <View key={item.id}>{renderBlogItem({ item, index })}</View>
              ))}
            </View>
          </>
        )}

        {/* Footer Space */}
        <View style={styles.footerSpace} />
      </AnimatedComponent.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },

  // ===== HEADER SECTION =====
  headerSection: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: fnpColors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: fnpColors.borderLight,
  },

  // ===== SEARCH BAR =====
  searchWrapper: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 15,
    color: fnpColors.text,
  },
  clearBtn: {
    padding: 4,
  },

  // ===== CATEGORY FILTER =====
  categoryFilterWrapper: {
    marginBottom: spacing.md,
  },
  categoryFilterList: {
    paddingHorizontal: spacing.screen,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: fnpColors.primary,
    borderColor: fnpColors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: fnpColors.textSecondary,
  },
  categoryChipTextActive: {
    color: fnpColors.white,
  },

  // ===== RESULT COUNT =====
  resultCountContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  resultCount: {
    fontSize: 13,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },

  // ===== BLOG CARD =====
  listContainer: {
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  blogCard: {
    borderRadius: 20,
    backgroundColor: fnpColors.white,
    overflow: "hidden",
    ...shadows.medium,
  },
  blogCardInner: {
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#F5F5F5",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: fnpColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryBadgeText: {
    color: fnpColors.white,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bookmarkBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  blogSubtitle: {
    fontSize: 14,
    color: fnpColors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  blogMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: fnpColors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  authorAvatarText: {
    color: fnpColors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  authorNameSmall: {
    fontSize: 13,
    fontWeight: "500",
    color: fnpColors.text,
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  readTimeText: {
    fontSize: 10,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  blogDate: {
    fontSize: 11,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tagChip: {
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagChipText: {
    fontSize: 10,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  moreTags: {
    fontSize: 10,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: fnpColors.borderLight,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  actionBtnTextActive: {
    color: fnpColors.danger,
  },

  // ===== FOOTER =====
  footerSpace: {
    height: 20,
  },
});
