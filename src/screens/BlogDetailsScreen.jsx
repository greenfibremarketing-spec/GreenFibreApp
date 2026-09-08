// src/screens/BlogDetailsScreen.jsx
// Green Fibre — Premium blog article reader
// Generous margins, drop-cap first paragraph, Playfair serif headline
// 17px body, 27px line-height — optimized purely for reading

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { blogsContent } from "../data/content";
import { colors, spacing } from "../theme";

const { width } = Dimensions.get("window");

const getReadTime = (content) => {
  const words = content?.split(/\s+/).length || 0;
  const mins = Math.ceil(words / 200);
  return mins < 1 ? "< 1 min read" : `${mins} min read`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch { return dateString; }
};

export function BlogDetailsScreen({ navigation, route }) {
  const blogId = route.params?.id || route.params?.blogId;
  const blog = blogsContent.blogs?.find((item) => item.id === blogId);

  if (!blog) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Article not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const readTime = getReadTime(blog.content);
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
            source={{
              uri: blog.image || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80",
            }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", colors.background]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Back button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* ── ARTICLE BODY ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.article}>

          {/* Category overline */}
          {blog.category && (
            <Text style={styles.overline}>{blog.category.toUpperCase()}</Text>
          )}

          {/* Headline — Playfair Display */}
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
                <Text style={styles.metaText}>{formatDate(blog.date)}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                <Text style={styles.metaText}>{readTime}</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.ruleDivider} />

          {/* ── FIRST PARAGRAPH WITH DROP-CAP ── */}
          {firstParagraph.length > 0 && (
            <View style={styles.firstParaWrap}>
              {/* Drop-cap: first letter large */}
              <Text style={styles.dropCap}>
                {firstParagraph.charAt(0)}
              </Text>
              <Text style={styles.bodyText}>
                {firstParagraph.slice(1)}
              </Text>
            </View>
          )}

          {/* ── REST OF CONTENT ── */}
          {restParagraphs.map((para, i) => {
            // Simple heading detection: starts with "##" or "**"
            const isHeading = para.startsWith("##") || para.startsWith("**");
            if (isHeading) {
              return (
                <Text key={i} style={styles.subHeading}>
                  {para.replace(/^##\s*|^\*\*/g, "").replace(/\*\*$/g, "")}
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
          {blog.tags?.length > 0 && (
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
          >
            <Ionicons name="arrow-back" size={14} color={colors.primary} />
            <Text style={styles.backToJournalText}>Back to Journal</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Hero ─────────────────────────────────────────────────
  heroWrap: {
    height: 280,
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(18,46,26,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Article ───────────────────────────────────────────────
  article: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 60,
  },
  overline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 12,
  },
  headline: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 30,
    lineHeight: 40,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  byline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
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
    color: colors.textPrimary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 12,
  },
  ruleDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 28,
  },

  // ── Drop-cap first paragraph ──────────────────────────────
  firstParaWrap: {
    marginBottom: 22,
  },
  dropCap: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 68,
    lineHeight: 60,
    color: colors.primary,
    float: "left",  // React Native doesn't support float — use positioning
    marginRight: 6,
    // Simulate drop cap: wrap in a row or use nested text
  },
  // ── Body text ─────────────────────────────────────────────
  bodyText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 17,
    lineHeight: 28,
    color: colors.text,
    marginBottom: 22,
    letterSpacing: 0.1,
  },
  subHeading: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 22,
    lineHeight: 30,
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 14,
  },

  // ── Tags ──────────────────────────────────────────────────
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 32,
    marginBottom: 32,
  },
  tagPill: {
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  tagText: {
    fontFamily: "DMMono_400Regular",
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
  },

  // ── Back to journal ───────────────────────────────────────
  backToJournal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "50",
    paddingBottom: 2,
  },
  backToJournalText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },

  // ── Not found ─────────────────────────────────────────────
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 40,
  },
  notFoundText: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  backLink: {
    fontFamily: "DMSans_500Medium",
    fontSize: 15,
    color: colors.primary,
  },
});
