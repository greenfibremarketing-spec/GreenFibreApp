import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";
import { blogsContent } from "../data/content";
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
  warning: "#FF9800",
  danger: "#F44336",
};

// Helper: calculate read time (~200 words per minute)
const getReadTime = (content) => {
  const words = content?.split(/\s+/).length || 0;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? "< 1 min read" : `${mins} min read`;
};

// Helper: format date
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function BlogDetailsScreen({ navigation, route }) {
  const blogId = route.params?.id || route.params?.blogId;
  const blog = blogsContent.blogs?.find((item) => item.id === blogId);

  // Local state for interactive features
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(blog?.likes || 0);
  const [isFollowing, setIsFollowing] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerScale = useSharedValue(0.95);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerScale.value = withSpring(1);
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ scale: headerScale.value }],
  }));

  // Share blog
  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌿 ${blog?.title || "Check out this article"}\n\n${blog?.content?.slice(0, 200)}...\n\nRead more on Green Fibre App`,
        title: blog?.title || "Green Fibre Blog",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share at the moment.");
    }
  };

  // Handle Like
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Handle Bookmark
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Removed from Bookmarks" : "Bookmarked!",
      isBookmarked
        ? "This article has been removed from your bookmarks."
        : "This article has been saved to your bookmarks.",
    );
  };

  // If no blog found, show empty state
  if (!blog) {
    return (
      <ScreenContainer
        onMenuPress={() => navigation.openDrawer()}
        headerTitle="Blog"
      >
        <EmptyState
          icon="document-text-outline"
          title="Article Not Found"
          message="The requested article does not exist."
          actionLabel="Back to Blogs"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  // Destructure blog fields with fallbacks
  const {
    title,
    subtitle,
    content,
    author = "Unknown Author",
    date = new Date().toISOString(),
    image = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    tags = [],
    category = "Lifestyle",
  } = blog;

  const readTime = getReadTime(content);
  const formattedDate = formatDate(date);

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle=""
      headerRight={
        <View style={styles.headerRightContainer}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="share-outline" size={22} color={fnpColors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBookmark}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? fnpColors.primary : fnpColors.text}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ===== COVER IMAGE WITH OVERLAY ===== */}
        <Animated.View style={[styles.imageWrapper, animatedHeaderStyle]}>
          <Image
            source={{ uri: image }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageOverlay}
          >
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{category}</Text>
            </View>
            <Text style={styles.overlayTitle}>{title}</Text>
            {subtitle && <Text style={styles.overlaySubtitle}>{subtitle}</Text>}
          </LinearGradient>
        </Animated.View>

        {/* ===== METADATA: AUTHOR, DATE, READ TIME ===== */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.metadataRow}
        >
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarText}>
              {author.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{author}</Text>
              <TouchableOpacity
                style={[styles.followBtn, isFollowing && styles.followingBtn]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text
                  style={[
                    styles.followBtnText,
                    isFollowing && styles.followingBtnText,
                  ]}
                >
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={fnpColors.textMuted}
              />
              <Text style={styles.dateText}>{formattedDate}</Text>
              <Ionicons
                name="time-outline"
                size={14}
                color={fnpColors.textMuted}
                style={styles.timeIcon}
              />
              <Text style={styles.dateText}>{readTime}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ===== TAGS ===== */}
        {tags.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(150).duration(500)}
            style={styles.tagsContainer}
          >
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                activeOpacity={0.7}
              >
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* ===== BLOG CONTENT ===== */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.contentWrapper}
        >
          <Text style={styles.contentText}>{content}</Text>
        </Animated.View>

        {/* ===== DIVIDER ===== */}
        <View style={styles.divider} />

        {/* ===== INTERACTIVE ACTION BAR ===== */}
        <Animated.View
          entering={FadeInUp.delay(250).duration(500)}
          style={styles.actionBar}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? fnpColors.danger : fnpColors.textSecondary}
              />
              {likeCount > 0 && (
                <View style={styles.actionCountBadge}>
                  <Text style={styles.actionCountText}>{likeCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.actionLabel, isLiked && styles.actionLabelActive]}
            >
              {isLiked ? "Liked" : "Like"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleBookmark}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? fnpColors.primary : fnpColors.textSecondary}
            />
            <Text
              style={[
                styles.actionLabel,
                isBookmarked && styles.actionLabelActive,
              ]}
            >
              {isBookmarked ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons
              name="share-social-outline"
              size={24}
              color={fnpColors.textSecondary}
            />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ===== RELATED ARTICLES (Optional) ===== */}
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>📖 You Might Also Like</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.relatedScroll}
          >
            {blogsContent.blogs
              ?.filter((b) => b.id !== blogId)
              .slice(0, 5)
              .map((relatedBlog, index) => (
                <TouchableOpacity
                  key={relatedBlog.id}
                  style={styles.relatedCard}
                  onPress={() =>
                    navigation.replace("BlogDetails", { id: relatedBlog.id })
                  }
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri:
                        relatedBlog.image ||
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400",
                    }}
                    style={styles.relatedImage}
                  />
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    {relatedBlog.title}
                  </Text>
                  <Text style={styles.relatedCardRead}>
                    {getReadTime(relatedBlog.content)}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* ===== BACK TO BLOGS BUTTON ===== */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[fnpColors.primary, fnpColors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.backButtonGradient}
          >
            <Ionicons name="arrow-back-circle-outline" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back to Blogs</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ===== FOOTER SPACER ===== */}
        <View style={styles.footerSpace} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 30,
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

  // ---- Cover Image ----
  imageWrapper: {
    position: "relative",
    height: 320,
    width: "100%",
    marginHorizontal: 0,
  },
  coverImage: {
    height: "100%",
    width: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  categoryBadge: {
    backgroundColor: fnpColors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: fnpColors.white,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 36,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: "#f0f0f0",
    marginTop: 4,
    fontWeight: "400",
    opacity: 0.9,
  },

  // ---- Metadata ----
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: fnpColors.borderLight,
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: fnpColors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    ...shadows.small,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  authorName: {
    fontSize: 17,
    fontWeight: "600",
    color: fnpColors.text,
  },
  followBtn: {
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  followingBtn: {
    backgroundColor: fnpColors.success,
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: fnpColors.primary,
  },
  followingBtnText: {
    color: "#fff",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: fnpColors.textMuted,
    marginLeft: 4,
  },
  timeIcon: {
    marginLeft: 12,
  },

  // ---- Tags ----
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  tag: {
    backgroundColor: fnpColors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 13,
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ---- Content ----
  contentWrapper: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  contentText: {
    fontSize: 17,
    lineHeight: 28,
    color: fnpColors.text,
  },

  // ---- Divider ----
  divider: {
    height: 1,
    backgroundColor: fnpColors.borderLight,
    marginHorizontal: 20,
    marginVertical: 16,
  },

  // ---- Action Bar ----
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    ...shadows.soft,
  },
  actionButton: {
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 4,
  },
  actionIconWrap: {
    position: "relative",
  },
  actionCountBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: fnpColors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  actionCountText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  actionLabel: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  actionLabelActive: {
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ---- Related Articles ----
  relatedSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 12,
  },
  relatedScroll: {
    flexDirection: "row",
  },
  relatedCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    ...shadows.soft,
  },
  relatedImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F5F5F5",
  },
  relatedCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: fnpColors.text,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  },
  relatedCardRead: {
    fontSize: 11,
    color: fnpColors.textMuted,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },

  // ---- Back Button ----
  backButton: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.medium,
  },
  backButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // ---- Footer ----
  footerSpace: {
    height: 20,
  },
});
