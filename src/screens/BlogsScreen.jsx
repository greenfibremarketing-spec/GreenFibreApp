// src/screens/BlogsScreen.jsx
// Green Fibre — Editorial magazine-style blog list
// Hero first post card (tall, full-width) + editorial list below (thumbnail + title + read-time)

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { blogsContent } from "../data/content";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { EmptyState } from "../components/common/EmptyState";
import { colors, spacing } from "../theme";

const { width } = Dimensions.get("window");

const getReadTime = (content) => {
  const words = content?.split(/\s+/).length || 0;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? "< 1 min" : `${mins} min`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateString; }
};

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

  const filteredBlogs = blogs.filter((b) => {
    if (selectedCategory === "all") return true;
    return b.category?.toLowerCase() === selectedCategory;
  });

  const heroBlog = filteredBlogs[0] || null;
  const listBlogs = filteredBlogs.slice(1);

  const goToDetails = (id) => navigation.navigate("BlogDetails", { id });

  return (
    <ScreenContainer onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())} showSearch={false}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

        {/* ── PAGE HEADER ───────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
          <Text style={styles.pageOverline}>GREEN FIBRE JOURNAL</Text>
          <Text style={styles.pageTitle}>Stories & Ideas</Text>
        </Animated.View>

        {/* ── CATEGORY FILTER PILLS ─────────────────────────── */}
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

        {/* ── HERO FIRST POST ───────────────────────────────── */}
        {heroBlog && (
          <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.heroWrap}>
            <TouchableOpacity activeOpacity={0.93} onPress={() => goToDetails(heroBlog.id)}>
              <View style={styles.heroCard}>
                <Image
                  source={{
                    uri: heroBlog.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
                  }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={300}
                />
                <LinearGradient
                  colors={["transparent", "rgba(18,46,26,0.88)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.heroText}>
                  {heroBlog.category && (
                    <View style={styles.heroCategoryPill}>
                      <Text style={styles.heroCategoryText}>
                        {heroBlog.category.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.heroTitle} numberOfLines={3}>
                    {heroBlog.title}
                  </Text>
                  <View style={styles.heroMeta}>
                    <Text style={styles.heroDate}>{formatDate(heroBlog.date)}</Text>
                    <Text style={styles.heroDot}>·</Text>
                    <Ionicons name="time-outline" size={12} color={colors.cream} style={{ opacity: 0.7 }} />
                    <Text style={styles.heroReadTime}>
                      {getReadTime(heroBlog.content)} read
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── BLOG LIST — editorial list layout ─────────────── */}
        {listBlogs.length === 0 && filteredBlogs.length === 0 ? (
          <EmptyState
            context="search"
            title="No articles yet"
            message="Check back soon for new stories."
          />
        ) : (
          <View style={styles.listSection}>
            <Text style={styles.listSectionLabel}>MORE ARTICLES</Text>
            {listBlogs.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInDown.delay(index * 60 + 200).duration(400)}
              >
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => goToDetails(item.id)}
                  activeOpacity={0.88}
                >
                  {/* Thumbnail */}
                  <Image
                    source={{
                      uri: item.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=70",
                    }}
                    style={styles.thumbnail}
                    contentFit="cover"
                    transition={200}
                  />
                  {/* Info */}
                  <View style={styles.listItemInfo}>
                    {item.category && (
                      <Text style={styles.listItemCategory}>
                        {item.category.toUpperCase()}
                      </Text>
                    )}
                    <Text style={styles.listItemTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.listItemMeta}>
                      <Text style={styles.listItemDate}>{formatDate(item.date)}</Text>
                      <Text style={styles.metaDot}>·</Text>
                      <Text style={styles.listItemReadTime}>
                        {getReadTime(item.content)} read
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {/* Divider */}
                <View style={styles.divider} />
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Page header ───────────────────────────────────────────
  pageHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: 28,
    paddingBottom: 20,
  },
  pageOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    lineHeight: 40,
    color: colors.textPrimary,
  },

  // ── Filter pills ──────────────────────────────────────────
  filterList: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.white,
  },

  // ── Hero post ─────────────────────────────────────────────
  heroWrap: {
    paddingHorizontal: spacing.screen,
    marginBottom: 28,
  },
  heroCard: {
    height: 260,
    borderRadius: 20,
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
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroCategoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 10,
  },
  heroCategoryText: {
    fontFamily: "DMMono_500Medium",
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.cream,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 22,
    lineHeight: 30,
    color: colors.cream,
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.cream,
    opacity: 0.7,
  },
  heroDot: {
    color: colors.cream,
    opacity: 0.5,
    fontSize: 14,
  },
  heroReadTime: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.cream,
    opacity: 0.7,
  },

  // ── List section ──────────────────────────────────────────
  listSection: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 40,
  },
  listSectionLabel: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingVertical: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.surfaceWarm,
    flexShrink: 0,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemCategory: {
    fontFamily: "DMMono_400Regular",
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.primary,
    marginBottom: 5,
  },
  listItemTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 16,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  listItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  listItemDate: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 12,
  },
  listItemReadTime: {
    fontFamily: "DMMono_400Regular",
    fontSize: 11,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
