// src/screens/BlogDetailsScreen.jsx
// Green Fibre — Premium blog article reader synced with backend API

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { blogService } from "../api/services/blogService";
import { colors, spacing } from "../theme";

const { width } = Dimensions.get("window");

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export function BlogDetailsScreen({ navigation, route }) {
  const blogId = route.params?.id || route.params?.slug || route.params?.blogId;
  const initialBlog = route.params?.blog || null;
  const [blog, setBlog] = useState(initialBlog);
  const [loading, setLoading] = useState(!initialBlog);

  useEffect(() => {
    let isMounted = true;
    async function loadArticle() {
      if (!blogId) return;
      try {
        const liveBlog = await blogService.getBlogBySlug(blogId);
        if (isMounted && liveBlog) {
          setBlog(liveBlog);
        }
      } catch (err) {
        console.warn("Failed to load blog details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [blogId]);

  const handleShare = async () => {
    if (!blog) return;
    try {
      await Share.share({
        title: blog.title,
        message: `Check out this article from Green Fibre: "${blog.title}"\n\n${blog.excerpt || ""}`,
      });
    } catch (_) {}
  };

  if (loading && !blog) {
    return (
      <View style={[styles.root, styles.centerWrap]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading story…</Text>
      </View>
    );
  }

  if (!blog) {
    return (
      <View style={styles.notFound}>
        <StatusBar barStyle="dark-content" />
        <Text style={styles.notFoundTitle}>Article Not Found</Text>
        <Text style={styles.notFoundText}>
          The requested article could not be loaded or may have been moved.
        </Text>
        <TouchableOpacity style={styles.backBtnPill} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color={colors.cream} />
          <Text style={styles.backBtnPillText}>Back to Stories</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const readTime = `${blog.readingTime || 3} min read`;
  const paragraphs = (blog.content || "").split("\n\n").filter(Boolean);
  const firstParagraph = paragraphs[0] || "";
  const restParagraphs = paragraphs.slice(1);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── HERO IMAGE ────────────────────────────────────── */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: blog.image }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", "rgba(18,46,26,0.9)", colors.background]}
            start={{ x: 0, y: 0.3 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Actions */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              style={styles.actionBtnCircle}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtnCircle}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── ARTICLE BODY ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.article}>
          {/* Category overline */}
          {blog.category ? (
            <View style={styles.categoryPill}>
              <Text style={styles.overline}>{blog.category.toUpperCase()}</Text>
            </View>
          ) : null}

          {/* Headline */}
          <Text style={styles.headline}>{blog.title}</Text>

          {/* Byline */}
          <View style={styles.byline}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {blog.author?.charAt(0)?.toUpperCase() || "G"}
              </Text>
            </View>
            <View>
              <Text style={styles.authorName}>{blog.author || "Green Fibre"}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{formatDate(blog.date || blog.createdAt)}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{readTime}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.ruleDivider} />

          {/* Excerpt callout if provided */}
          {blog.excerpt && blog.excerpt !== blog.content ? (
            <View style={styles.excerptBox}>
              <Ionicons
                name="quote"
                size={20}
                color={colors.primary}
                style={{ opacity: 0.35, marginBottom: 4 }}
              />
              <Text style={styles.excerptText}>{blog.excerpt}</Text>
            </View>
          ) : null}

          {/* ── FIRST PARAGRAPH WITH DROP-CAP ── */}
          {firstParagraph.length > 0 && (
            <View style={styles.firstParaWrap}>
              <Text style={styles.dropCap}>{firstParagraph.charAt(0)}</Text>
              <Text style={styles.bodyText}>{firstParagraph.slice(1)}</Text>
            </View>
          )}

          {/* ── REST OF CONTENT ── */}
          {restParagraphs.map((para, i) => {
            const isHeading =
              para.startsWith("##") ||
              para.startsWith("**") ||
              para.startsWith("###");
            if (isHeading) {
              return (
                <Text key={i} style={styles.subHeading}>
                  {para.replace(/^#+\s*|^\*\*/g, "").replace(/\*\*$/g, "")}
                </Text>
              );
            }
            return (
              <Text key={i} style={styles.bodyText}>
                {para}
              </Text>
            );
          })}

          {/* ── TAGS ── */}
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <View style={styles.tagsWrap}>
              {blog.tags.map((tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* ── BACK TO JOURNAL ── */}
          <TouchableOpacity
            style={styles.backToJournal}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={15} color={colors.primary} />
            <Text style={styles.backToJournalText}>Back to Stories & Journal</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: colors.background,
    gap: 12,
  },
  notFoundTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: colors.text,
  },
  notFoundText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 10,
  },
  backBtnPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnPillText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: colors.cream,
  },

  // ── Hero ─────────────────────────────────────────────────
  heroWrap: {
    height: 320,
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  topActionsRow: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtnCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(18,46,26,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  // ── Article ───────────────────────────────────────────────
  article: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 60,
  },
  categoryPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  overline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.primary,
  },
  headline: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
    marginBottom: 18,
  },
  byline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  authorInitial: {
    fontFamily: "DMSans_700Bold",
    fontSize: 16,
    color: colors.primary,
  },
  authorName: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: colors.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  metaText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.textSecondary,
  },
  metaDot: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: "rgba(28, 74, 42, 0.1)",
    marginBottom: 20,
  },

  // ── Excerpt Callout ──────────────────────────────────────
  excerptBox: {
    backgroundColor: colors.creamDark,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  excerptText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    fontStyle: "italic",
  },

  // ── Content ──────────────────────────────────────────────
  firstParaWrap: {
    marginBottom: 18,
  },
  dropCap: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 54,
    lineHeight: 54,
    color: colors.primary,
    float: "left",
    marginRight: 8,
  },
  subHeading: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  bodyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 18,
  },

  // ── Tags ─────────────────────────────────────────────────
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    marginBottom: 28,
  },
  tagPill: {
    backgroundColor: colors.creamDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontFamily: "DMMono_500Medium",
    fontSize: 11,
    color: colors.primary,
  },

  // ── Back Button ──────────────────────────────────────────
  backToJournal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "40",
  },
  backToJournalText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: colors.primary,
  },
});
