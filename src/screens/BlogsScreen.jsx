// src/screens/BlogsScreen.jsx
// Green Fibre — Editorial magazine-style blog list synced with backend API

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { blogService } from "../api/services/blogService";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";
import { colors, spacing } from "../theme";

const { width } = Dimensions.get("window");

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function BlogsScreen() {
  const navigation = useNavigation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const loadBlogs = useCallback(async () => {
    try {
      const data = await blogService.getBlogs();
      setBlogs(data);
    } catch (err) {
      console.warn("Failed to load blogs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBlogs();
  }, [loadBlogs]);

  // Extract unique categories/tags dynamically from live blogs
  const categories = useMemo(() => {
    const tagsSet = new Set();
    blogs.forEach((b) => {
      if (b.category) tagsSet.add(b.category);
      if (Array.isArray(b.tags)) {
        b.tags.forEach((t) => tagsSet.add(t));
      }
    });

    const list = [{ id: "all", label: "All Stories" }];
    tagsSet.forEach((tag) => {
      if (tag && typeof tag === "string" && tag.trim().toLowerCase() !== "all") {
        list.push({ id: tag.toLowerCase(), label: tag });
      }
    });
    return list;
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    if (selectedCategory === "all") return blogs;
    return blogs.filter((b) => {
      const matchCat = b.category?.toLowerCase() === selectedCategory;
      const matchTag = b.tags?.some((t) => t.toLowerCase() === selectedCategory);
      return matchCat || matchTag;
    });
  }, [blogs, selectedCategory]);

  const heroBlog = filteredBlogs[0] || null;
  const listBlogs = filteredBlogs.slice(1);

  const goToDetails = (blog) => {
    const id = blog.slug || blog.id || blog._id;
    navigation.navigate("BlogDetails", { id, slug: blog.slug, blog });
  };

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      showSearch={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ── PAGE HEADER ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
          <Text style={styles.pageOverline}>GREEN FIBRE JOURNAL</Text>
          <Text style={styles.pageTitle}>Stories & Ideas</Text>
          <Text style={styles.pageSubtitle}>
            Insights on sustainable living, fabric craft, and conscious lifestyle.
          </Text>
        </Animated.View>

        {/* ── CATEGORY FILTER PILLS ─────────────────────────── */}
        {categories.length > 1 && (
          <Animated.View entering={FadeInDown.delay(80).duration(400)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterPill,
                    selectedCategory === cat.id && styles.filterPillActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedCategory === cat.id && styles.filterPillTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching latest stories…</Text>
          </View>
        ) : (
          <>
            {/* ── HERO FIRST POST ───────────────────────────────── */}
            {heroBlog ? (
              <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.heroWrap}>
                <TouchableOpacity
                  activeOpacity={0.93}
                  onPress={() => goToDetails(heroBlog)}
                >
                  <View style={styles.heroCard}>
                    <Image
                      source={{ uri: heroBlog.image }}
                      style={styles.heroImage}
                      contentFit="cover"
                      transition={300}
                    />
                    <LinearGradient
                      colors={["transparent", "rgba(18,46,26,0.92)"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.heroText}>
                      <View style={styles.heroCategoryRow}>
                        <View style={styles.heroCategoryPill}>
                          <Text style={styles.heroCategoryText}>
                            {heroBlog.category.toUpperCase()}
                          </Text>
                        </View>
                        {heroBlog.author ? (
                          <Text style={styles.heroAuthorText}>by {heroBlog.author}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.heroTitle} numberOfLines={3}>
                        {heroBlog.title}
                      </Text>
                      {heroBlog.excerpt ? (
                        <Text style={styles.heroExcerpt} numberOfLines={2}>
                          {heroBlog.excerpt}
                        </Text>
                      ) : null}
                      <View style={styles.heroMeta}>
                        <Text style={styles.heroDate}>{formatDate(heroBlog.date)}</Text>
                        <Text style={styles.heroDot}>·</Text>
                        <Ionicons
                          name="time-outline"
                          size={12}
                          color={colors.cream}
                          style={{ opacity: 0.8 }}
                        />
                        <Text style={styles.heroReadTime}>
                          {heroBlog.readingTime} min read
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ) : null}

            {/* ── BLOG LIST — editorial list layout ─────────────── */}
            {filteredBlogs.length === 0 ? (
              <EmptyState
                context="search"
                title="No articles yet"
                message="Check back soon for new sustainable stories and updates."
              />
            ) : listBlogs.length > 0 ? (
              <View style={styles.listSection}>
                <Text style={styles.listSectionLabel}>MORE ARTICLES</Text>
                {listBlogs.map((item, index) => (
                  <Animated.View
                    key={item.slug || item._id || item.id || String(index)}
                    entering={FadeInDown.delay(index * 50 + 150).duration(400)}
                  >
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => goToDetails(item)}
                      activeOpacity={0.88}
                    >
                      {/* Thumbnail */}
                      <Image
                        source={{ uri: item.image }}
                        style={styles.thumbnail}
                        contentFit="cover"
                        transition={200}
                      />
                      {/* Info */}
                      <View style={styles.listItemInfo}>
                        {item.category ? (
                          <Text style={styles.listItemCategory}>
                            {item.category.toUpperCase()}
                          </Text>
                        ) : null}
                        <Text style={styles.listItemTitle} numberOfLines={2}>
                          {item.title}
                        </Text>
                        {item.excerpt ? (
                          <Text style={styles.listItemExcerpt} numberOfLines={2}>
                            {item.excerpt}
                          </Text>
                        ) : null}
                        <View style={styles.listItemMeta}>
                          <Text style={styles.listItemDate}>{formatDate(item.date)}</Text>
                          <Text style={styles.metaDot}>·</Text>
                          <Text style={styles.listItemReadTime}>
                            {item.readingTime} min read
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {/* Divider */}
                    <View style={styles.divider} />
                  </Animated.View>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingWrap: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
  },
  pageHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: 20,
    paddingBottom: 16,
  },
  pageOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 11,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 4,
  },
  pageTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  // ── Filters ──────────────────────────────────────────────────
  filterList: {
    paddingHorizontal: spacing.screen,
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.creamDark,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterPillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.cream,
  },

  // ── Hero ─────────────────────────────────────────────────────
  heroWrap: {
    paddingHorizontal: spacing.screen,
    marginBottom: 28,
  },
  heroCard: {
    height: 320,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroText: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroCategoryPill: {
    backgroundColor: "rgba(250,247,240,0.22)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  heroCategoryText: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.cream,
  },
  heroAuthorText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.cream,
    opacity: 0.85,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    lineHeight: 28,
    color: colors.cream,
    marginBottom: 6,
  },
  heroExcerpt: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 18,
    color: colors.cream,
    opacity: 0.88,
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.cream,
    opacity: 0.75,
  },
  heroDot: {
    color: colors.cream,
    opacity: 0.5,
    fontSize: 12,
  },
  heroReadTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.cream,
    opacity: 0.75,
  },

  // ── List ─────────────────────────────────────────────────────
  listSection: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
  },
  listSectionLabel: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  listItem: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.creamDark,
  },
  listItemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  listItemCategory: {
    fontFamily: "DMMono_500Medium",
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 3,
  },
  listItemTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 16,
    lineHeight: 21,
    color: colors.text,
    marginBottom: 4,
  },
  listItemExcerpt: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  listItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  listItemDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  listItemReadTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(28, 74, 42, 0.08)",
    marginTop: 4,
  },
});
