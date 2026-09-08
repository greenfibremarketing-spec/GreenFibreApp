// src/components/common/LegalPageView.jsx
// Green Fibre — Premium policy page layout
// TOC with jump-links at top, body serif/sans pairing, 16px/26px body
// No card boxes — plain, well-typeset long-form on cream bg

import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacing } from "../../theme";

// ── Section refs map ──────────────────────────────────────────────────────
// We track Y-positions to enable jump-links

// ── Renders a single content section ─────────────────────────────────────
function LegalSection({ section, index, sectionRef }) {
  const sectionTitle = section?.title || `Section ${index + 1}`;

  const renderContent = (content) => {
    if (!content) return null;
    if (typeof content === "string") {
      return <Text style={styles.paragraph}>{content}</Text>;
    }
    if (Array.isArray(content)) {
      return content.map((para, i) => (
        <Text key={i} style={styles.paragraph}>{para}</Text>
      ));
    }
    return null;
  };

  return (
    <View ref={sectionRef} style={styles.section}>
      {/* Section heading — Playfair Display */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionNumber}>{String(index + 1).padStart(2, "0")}</Text>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      </View>

      {renderContent(section.content)}

      {/* Subsections */}
      {section.subsections?.map((sub, i) => (
        <View key={i} style={styles.subsection}>
          {sub.title && <Text style={styles.subsectionTitle}>{sub.title}</Text>}
          {sub.content && <Text style={styles.paragraph}>{sub.content}</Text>}
          {sub.items?.map((item, j) => (
            <View key={j} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Items list (when no subsections) */}
      {section.items?.length > 0 && !section.subsections && (
        <View style={styles.bulletList}>
          {section.items.map((item, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Section divider */}
      <View style={styles.sectionDivider} />
    </View>
  );
}

// ── Table of Contents ─────────────────────────────────────────────────────
function TableOfContents({ sections, onPress }) {
  if (!sections?.length) return null;

  return (
    <View style={styles.tocWrap}>
      <Text style={styles.tocOverline}>CONTENTS</Text>
      {sections.map((section, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tocItem}
          onPress={() => onPress(index)}
          activeOpacity={0.7}
        >
          <Text style={styles.tocNumber}>{String(index + 1).padStart(2, "0")}</Text>
          <Text style={styles.tocTitle} numberOfLines={1}>
            {section?.title || `Section ${index + 1}`}
          </Text>
          <Ionicons name="arrow-down" size={12} color={colors.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────
export function LegalPageView({ page, navigation }) {
  const scrollRef = useRef(null);
  const sectionRefs = useRef([]);

  const pageData = page || {};
  const title = pageData.title || "Legal Page";
  const lastUpdated = pageData.lastUpdated || "January 2024";
  const intro = pageData.intro || [];
  const sections = pageData.sections || [];
  const relatedLinks = pageData.relatedLinks || [];

  const scrollToSection = (index) => {
    sectionRefs.current[index]?.measureLayout(
      scrollRef.current,
      (_, y) => {
        scrollRef.current?.scrollTo({ y: y - 20, animated: true });
      },
      () => {},
    );
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {/* ── TOP BACK / MENU BUTTON ──────────────────────── */}
      {navigation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Tabs", { screen: "Home" });
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
      )}

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={styles.updatedRow}>
          <Ionicons name="time-outline" size={13} color={colors.textMuted} />
          <Text style={styles.updatedText}>Last updated: {lastUpdated}</Text>
        </View>
      </Animated.View>

      {/* ── INTRO PARAGRAPHS ──────────────────────────────── */}
      {(Array.isArray(intro) ? intro : [intro]).filter(Boolean).map((p, i) => (
        <Animated.View key={i} entering={FadeInDown.delay(80).duration(400)}>
          <Text style={styles.introParagraph}>{p}</Text>
        </Animated.View>
      ))}

      {/* ── TABLE OF CONTENTS ─────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <TableOfContents sections={sections} onPress={scrollToSection} />
      </Animated.View>

      {/* ── DIVIDER ───────────────────────────────────────── */}
      <View style={styles.mainDivider} />

      {/* ── SECTIONS ──────────────────────────────────────── */}
      {sections.map((section, index) => (
        <Animated.View
          key={index}
          entering={FadeInDown.delay(index * 40 + 160).duration(400)}
        >
          <LegalSection
            section={section}
            index={index}
            sectionRef={(ref) => { sectionRefs.current[index] = ref; }}
          />
        </Animated.View>
      ))}

      {/* ── RELATED LINKS ─────────────────────────────────── */}
      {relatedLinks.length > 0 && (
        <View style={styles.relatedWrap}>
          <Text style={styles.relatedOverline}>RELATED POLICIES</Text>
          {relatedLinks.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={styles.relatedItem}
              onPress={() => navigation?.navigate(link.route)}
            >
              <Text style={styles.relatedText}>{link.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── FOOTER NOTE ───────────────────────────────────── */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          For questions about any of our policies, contact us at{" "}
          <Text style={styles.footerLink}>support@greenfibre.com</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.creamDark || '#EDE8DF',
  },
  backButtonText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: colors.textPrimary,
  },

  // ── Page header ───────────────────────────────────────────
  pageHeader: {
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 30,
    lineHeight: 38,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  updatedText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: colors.textMuted,
  },

  // ── Intro ──────────────────────────────────────────────────
  introParagraph: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    lineHeight: 26,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // ── Table of contents ──────────────────────────────────────
  tocWrap: {
    backgroundColor: colors.primarySurface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  tocOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.primary,
    marginBottom: 14,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryMuted,
  },
  tocNumber: {
    fontFamily: "DMMono_400Regular",
    fontSize: 11,
    color: colors.primary,
    width: 22,
  },
  tocTitle: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },

  // ── Main divider ───────────────────────────────────────────
  mainDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 32,
  },

  // ── Section ───────────────────────────────────────────────
  section: {
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  sectionNumber: {
    fontFamily: "DMMono_400Regular",
    fontSize: 12,
    color: colors.primary,
    marginTop: 3,
  },
  sectionTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
    flex: 1,
  },
  paragraph: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 16,
  },

  // ── Subsections ───────────────────────────────────────────
  subsection: {
    marginBottom: 16,
    paddingLeft: 34,
  },
  subsectionTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    marginBottom: 8,
  },

  // ── Bullet list ───────────────────────────────────────────
  bulletList: {
    paddingLeft: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
    paddingLeft: 34,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 9,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    flex: 1,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 24,
    marginBottom: 28,
  },

  // ── Related links ─────────────────────────────────────────
  relatedWrap: {
    marginTop: 8,
    marginBottom: 32,
  },
  relatedOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  relatedText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: colors.primary,
  },

  // ── Footer note ───────────────────────────────────────────
  footerNote: {
    padding: 20,
    backgroundColor: colors.creamDark,
    borderRadius: 12,
  },
  footerText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  footerLink: {
    fontFamily: "DMSans_500Medium",
    color: colors.primary,
  },
});
