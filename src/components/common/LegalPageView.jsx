
// src/components/common/LegalPageView.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, shadows } from "../../theme";

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

// Icon mapping for different page types
const pageIcons = {
  "Privacy Policy": "shield-checkmark-outline",
  "Terms & Conditions": "document-text-outline",
  "Shipping Policy": "car-outline",
  "Refund Policy": "return-down-back-outline",
};

// Section Item Component - handles different data structures
const SectionItem = ({ section, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Get section title
  const sectionTitle = section?.title || `Section ${index + 1}`;

  return (
    <Animated.View
      style={[
        styles.sectionWrapper,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconWrap}>
            <LinearGradient
              colors={[fnpColors.primaryLight, "#F8BBD0"]}
              style={styles.sectionIconGradient}
            >
              <Text style={styles.sectionIconNumber}>{index + 1}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={fnpColors.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.sectionContent}>
          {/* Handle direct content (string) */}
          {section.content && typeof section.content === "string" && (
            <Text style={styles.paragraph}>{section.content}</Text>
          )}

          {/* Handle subsections */}
          {section.subsections && section.subsections.length > 0 && (
            <View style={styles.subsectionsContainer}>
              {section.subsections.map((sub, i) => (
                <View key={i} style={styles.subsection}>
                  {sub.title && (
                    <Text style={styles.subsectionTitle}>{sub.title}</Text>
                  )}
                  {sub.content && (
                    <Text style={styles.subsectionContent}>{sub.content}</Text>
                  )}
                  {sub.items && sub.items.length > 0 && (
                    <View style={styles.listContainer}>
                      {sub.items.map((item, j) => (
                        <View key={j} style={styles.listItem}>
                          <View style={styles.listBullet}>
                            <Ionicons
                              name="checkmark-circle"
                              size={16}
                              color={fnpColors.primary}
                            />
                          </View>
                          <Text style={styles.listText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Handle items list */}
          {section.items &&
            section.items.length > 0 &&
            !section.subsections && (
              <View style={styles.listContainer}>
                {section.items.map((item, i) => (
                  <View key={i} style={styles.listItem}>
                    <View style={styles.listBullet}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={fnpColors.primary}
                      />
                    </View>
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}

          {/* Handle array of content strings (legacy format) */}
          {section.content &&
            Array.isArray(section.content) &&
            section.content.map((paragraph, i) => (
              <Text key={i} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
        </View>
      )}
    </Animated.View>
  );
};

// Quick Navigation Component
const QuickNav = ({ sections, onPress }) => {
  if (!sections || sections.length === 0) return null;

  return (
    <View style={styles.quickNavContainer}>
      <Text style={styles.quickNavTitle}>📑 Quick Navigation</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickNavScroll}
      >
        {sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickNavItem}
            onPress={() => onPress(index)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickNavText}>
              {section?.title || `Section ${index + 1}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Related Links Component
const RelatedLinks = ({ links, navigation }) => {
  if (!links || links.length === 0) return null;

  return (
    <View style={styles.relatedLinksContainer}>
      <Text style={styles.relatedLinksTitle}>🔗 Related Pages</Text>
      <View style={styles.relatedLinksGrid}>
        {links.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.relatedLinkItem}
            onPress={() => navigation.navigate(link.route)}
            activeOpacity={0.7}
          >
            <Ionicons name="link-outline" size={16} color={fnpColors.primary} />
            <Text style={styles.relatedLinkText}>{link.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={fnpColors.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Main LegalPageView Component
export function LegalPageView({ page, navigation }) {
  const scrollRef = useRef(null);

  // Safe data extraction with fallbacks
  const pageData = page || {};
  const title = pageData.title || "Legal Page";
  const lastUpdated = pageData.lastUpdated || "January 1, 2024";
  const intro = pageData.intro || [];
  const sections = pageData.sections || [];
  const relatedLinks = pageData.relatedLinks || [];

  // Get icon for page
  const iconName = pageIcons[title] || "document-text-outline";

  // Handle scroll to section
  const scrollToSection = (index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        y: index * 100 + 200,
        animated: true,
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    try {
      const shareMessage = `📋 ${title}\n\n${intro.join("\n\n")}\n\n${sections.map((s) => `${s?.title || "Section"}\n`).join("\n")}\n\nLast Updated: ${lastUpdated}`;

      await Share.share({
        message: shareMessage,
        title: title,
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share at the moment.");
    }
  };

  // Handle print (simulated)
  const handlePrint = () => {
    Alert.alert("Print", "Print functionality will be available soon.");
  };

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={[fnpColors.primary, fnpColors.primaryDark]}
            style={styles.headerIconGradient}
          >
            <Ionicons name={iconName} size={40} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>
          We value your privacy and are committed to protecting your personal
          data.
        </Text>

        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <LinearGradient
            colors={[fnpColors.primaryLight, "#F8BBD0"]}
            style={styles.lastUpdatedGradient}
          >
            <Ionicons name="time-outline" size={16} color={fnpColors.primary} />
            <Text style={styles.lastUpdatedText}>
              Last Updated: {lastUpdated}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Intro Section */}
      {intro.length > 0 && (
        <View style={styles.introContainer}>
          {intro.map((paragraph, i) => (
            <Text key={i} style={styles.introText}>
              {paragraph}
            </Text>
          ))}
        </View>
      )}

      {/* Quick Navigation */}
      {sections.length > 3 && (
        <QuickNav sections={sections} onPress={scrollToSection} />
      )}

      {/* Sections */}
      <View style={styles.sectionsContainer}>
        {sections.map((section, index) => (
          <SectionItem key={index} section={section} index={index} />
        ))}
      </View>

      {/* Related Links */}
      <RelatedLinks links={relatedLinks} navigation={navigation} />

      {/* Footer */}
      <View style={styles.footer}>
        <LinearGradient
          colors={["#F5F5F5", "#FFFFFF"]}
          style={styles.footerGradient}
        >
          <View style={styles.footerContent}>
            <Ionicons
              name="shield-outline"
              size={24}
              color={fnpColors.primary}
            />
            <Text style={styles.footerTitle}>Need Help?</Text>
            <Text style={styles.footerText}>
              If you have any questions, our support team is here to help.
            </Text>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => navigation.navigate("Contact")}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[fnpColors.primary, fnpColors.primaryDark]}
                style={styles.contactBtnGradient}
              >
                <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
                <Text style={styles.contactBtnText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 20,
  },

  // ===== HEADER =====
  headerSection: {
    alignItems: "center",
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerIconContainer: {
    marginBottom: spacing.md,
  },
  headerIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.medium,
  },
  headerTitle: {
    ...typography.h1,
    color: fnpColors.text,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // ===== LAST UPDATED =====
  lastUpdatedContainer: {
    width: "100%",
  },
  lastUpdatedGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  lastUpdatedText: {
    ...typography.bodySmall,
    color: fnpColors.primaryDark,
    fontWeight: "600",
  },

  // ===== INTRO =====
  introContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.lg,
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginHorizontal: spacing.screen,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  introText: {
    ...typography.body,
    color: fnpColors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontSize: 14,
  },

  // ===== QUICK NAV =====
  quickNavContainer: {
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.md,
  },
  quickNavTitle: {
    ...typography.body,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  quickNavScroll: {
    gap: 8,
  },
  quickNavItem: {
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickNavText: {
    ...typography.bodySmall,
    color: fnpColors.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  // ===== SECTIONS =====
  sectionsContainer: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  sectionWrapper: {
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
    ...shadows.soft,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: fnpColors.white,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  sectionIconWrap: {
    marginRight: spacing.sm,
  },
  sectionIconGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionIconNumber: {
    color: fnpColors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  sectionTitle: {
    ...typography.h3,
    color: fnpColors.text,
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },
  sectionContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  paragraph: {
    ...typography.body,
    color: fnpColors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  subsectionsContainer: {
    gap: spacing.md,
  },
  subsection: {
    marginBottom: spacing.sm,
  },
  subsectionTitle: {
    ...typography.h3,
    color: fnpColors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  subsectionContent: {
    ...typography.body,
    color: fnpColors.textSecondary,
    lineHeight: 22,
    fontSize: 14,
  },
  listContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  listBullet: {
    marginTop: 2,
  },
  listText: {
    ...typography.body,
    color: fnpColors.textSecondary,
    lineHeight: 22,
    flex: 1,
    fontSize: 14,
  },

  // ===== RELATED LINKS =====
  relatedLinksContainer: {
    paddingHorizontal: spacing.screen,
    marginTop: spacing.xl,
  },
  relatedLinksTitle: {
    ...typography.body,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  relatedLinksGrid: {
    gap: spacing.sm,
  },
  relatedLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    ...shadows.soft,
  },
  relatedLinkText: {
    ...typography.body,
    color: fnpColors.text,
    fontWeight: "500",
    flex: 1,
    fontSize: 14,
  },

  // ===== FOOTER =====
  footer: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.xl,
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
    ...shadows.soft,
  },
  footerGradient: {
    padding: spacing.xl,
  },
  footerContent: {
    alignItems: "center",
  },
  footerTitle: {
    ...typography.h3,
    color: fnpColors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    fontSize: 18,
  },
  footerText: {
    ...typography.body,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  contactBtn: {
    borderRadius: 16,
    overflow: "hidden",
    ...shadows.medium,
  },
  contactBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  contactBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // ===== SPACER =====
  bottomSpacer: {
    height: 20,
  },
});
