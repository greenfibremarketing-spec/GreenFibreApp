import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { sustainabilityContent } from "../data/content";
import { placeholders } from "../data/images";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { StatCard } from "../components/common/StatCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/common/Button";

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
  green: "#2E7D32",
  greenLight: "#E8F5E9",
};

export function SustainabilityScreen() {
  const navigation = useNavigation();
  const [expandedInitiatives, setExpandedInitiatives] = useState({});
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const toggleInitiative = (index) => {
    setExpandedInitiatives((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Handle share
  const handleShare = () => {
    Alert.alert(
      "Share",
      "Share our sustainability initiatives with your friends!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: () => {
            // Share functionality
            Alert.alert("Share", "Sharing feature coming soon!");
          },
        },
      ],
    );
  };

  // Safe data access with fallbacks
  const heroEyebrow = sustainabilityContent?.heroEyebrow || "🌱 Sustainability";
  const heroTitle = sustainabilityContent?.heroTitle || "Making a Difference";
  const heroSubtitle =
    sustainabilityContent?.heroSubtitle ||
    "Together we can create a greener future";
  const impactStats = sustainabilityContent?.impactStats || [
    { value: "10K+", label: "Trees Planted", subtitle: "And counting" },
    { value: "50K+", label: "Products Sold", subtitle: "Eco-friendly" },
  ];
  const initiatives = sustainabilityContent?.initiatives || [
    {
      title: "Tree Plantation",
      description: "Planting trees for a greener future",
      stat: "10,000+ trees planted",
    },
    {
      title: "Plastic Free",
      description: "Eliminating single-use plastics",
      stat: "95% plastic-free",
    },
  ];
  const certifications = sustainabilityContent?.certifications || [
    "Eco-Friendly",
    "Sustainable",
    "Green Certified",
  ];
  const commitments = sustainabilityContent?.commitments || [
    "100% sustainable products",
    "Carbon neutral delivery",
    "Support local communities",
  ];

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="Sustainability"
      headerRight={
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={22} color={fnpColors.text} />
        </TouchableOpacity>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={{ opacity: fadeAnim }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        {/* ===== HERO BANNER ===== */}
        <View style={styles.heroWrap}>
          <Image
            source={{
              uri:
                placeholders?.sustainability ||
                "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
            }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(46,125,50,0.85)", "rgba(27,94,32,0.95)"]}
            style={styles.heroOverlay}
          >
            <View style={styles.heroBadge}>
              <Ionicons name="leaf-outline" size={14} color="#FFD700" />
              <Text style={styles.heroBadgeText}>{heroEyebrow}</Text>
            </View>
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
            <TouchableOpacity style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>Learn More</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ===== IMPACT STATS ===== */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsSectionTitle}>Our Impact</Text>
          <View style={styles.statsRow}>
            {impactStats.map((stat, i) => (
              <Animated.View key={i} style={styles.statWrap}>
                <StatCard
                  value={stat.value}
                  label={stat.label}
                  subtitle={stat.subtitle}
                  compact
                />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* ===== ECO TIPS ===== */}
        <View style={styles.ecoTipsContainer}>
          <LinearGradient
            colors={[fnpColors.greenLight, "#C8E6C9"]}
            style={styles.ecoTipsGradient}
          >
            <View style={styles.ecoTipsHeader}>
              <Ionicons name="bulb-outline" size={24} color={fnpColors.green} />
              <Text style={styles.ecoTipsTitle}>💡 Eco Tips</Text>
            </View>
            <Text style={styles.ecoTipsText}>
              "Every small action counts. Reduce, reuse, and recycle to make a
              difference."
            </Text>
            <View style={styles.ecoTipsBadges}>
              <View style={styles.ecoTipsBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={fnpColors.green}
                />
                <Text style={styles.ecoTipsBadgeText}>Reduce Plastic</Text>
              </View>
              <View style={styles.ecoTipsBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={fnpColors.green}
                />
                <Text style={styles.ecoTipsBadgeText}>Save Energy</Text>
              </View>
              <View style={styles.ecoTipsBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={fnpColors.green}
                />
                <Text style={styles.ecoTipsBadgeText}>Plant Trees</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ===== INITIATIVES ===== */}
        <SectionHeader
          title="🌿 Our Initiatives"
          subtitle="Comprehensive programs driving real environmental impact"
        />

        {initiatives.map((initiative, i) => (
          <Animated.View key={i} style={styles.initiativeCard}>
            <TouchableOpacity
              style={styles.initiativeHeader}
              onPress={() => toggleInitiative(i)}
              activeOpacity={0.7}
            >
              <View style={styles.initiativeIcon}>
                <LinearGradient
                  colors={[fnpColors.primaryLight, "#C8E6C9"]}
                  style={styles.initiativeIconGradient}
                >
                  <Ionicons name="leaf" size={22} color={fnpColors.primary} />
                </LinearGradient>
              </View>
              <Text style={styles.initiativeTitle}>{initiative.title}</Text>
              <Ionicons
                name={expandedInitiatives[i] ? "chevron-up" : "chevron-down"}
                size={20}
                color={fnpColors.textMuted}
              />
            </TouchableOpacity>

            {(expandedInitiatives[i] || i < 2) && (
              <View style={styles.initiativeContent}>
                <Text style={styles.initiativeDesc}>
                  {initiative.description}
                </Text>
                <View style={styles.initiativeStat}>
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color={fnpColors.primary}
                  />
                  <Text style={styles.initiativeStatText}>
                    {initiative.stat}
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>
        ))}

        {/* ===== PROGRESS BAR ===== */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>🌍 Our Progress</Text>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Trees Planted</Text>
              <Text style={styles.progressValue}>10,000+</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "75%" }]} />
            </View>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Plastic Reduced</Text>
              <Text style={styles.progressValue}>95%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "95%" }]} />
            </View>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Carbon Offset</Text>
              <Text style={styles.progressValue}>50%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "50%" }]} />
            </View>
          </View>
        </View>

        {/* ===== CERTIFICATIONS ===== */}
        <SectionHeader title="🏅 Our Certifications" />
        <View style={styles.certGrid}>
          {certifications.map((cert, i) => (
            <Animated.View key={i} style={styles.certBadge}>
              <LinearGradient
                colors={[fnpColors.primaryLight, "#C8E6C9"]}
                style={styles.certIconWrap}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={fnpColors.primary}
                />
              </LinearGradient>
              <Text style={styles.certText}>{cert}</Text>
            </Animated.View>
          ))}
        </View>

        {/* ===== COMMITMENTS ===== */}
        <SectionHeader
          title="🤝 Our Commitments"
          subtitle="Promises we make to our planet and community"
        />
        <View style={styles.commitmentsCard}>
          {commitments.map((c, i) => (
            <View key={i} style={styles.commitmentRow}>
              <View style={styles.commitmentIconWrap}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={fnpColors.success}
                />
              </View>
              <Text style={styles.commitmentText}>{c}</Text>
            </View>
          ))}
        </View>

        {/* ===== CTA SECTION ===== */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={[fnpColors.primary, fnpColors.primaryDark]}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaIconWrap}>
              <Ionicons name="leaf-outline" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.ctaTitle}>Make a Difference Today</Text>
            <Text style={styles.ctaText}>
              Every purchase contributes to a greener planet. Join us in
              creating a sustainable future.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate("Shop")}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaBtnText}>Start Shopping Sustainably</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🌱 Together for a greener tomorrow
          </Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Terms</Text>
            <Text style={styles.footerDot}>•</Text>
            <Text style={styles.footerLink}>Contact</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
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
  bottomSpacer: {
    height: 20,
  },

  // ===== HERO =====
  heroWrap: {
    height: 320,
    margin: spacing.screen || 16,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.medium,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl || 24,
    justifyContent: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: spacing.md || 12,
    gap: 6,
  },
  heroBadgeText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: fnpColors.white,
    marginBottom: spacing.sm || 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    marginBottom: spacing.lg || 16,
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ===== STATS =====
  statsContainer: {
    paddingHorizontal: spacing.screen || 16,
    marginBottom: spacing.md || 12,
  },
  statsSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: spacing.md || 12,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm || 8,
  },
  statWrap: {
    width: "48%",
  },

  // ===== ECO TIPS =====
  ecoTipsContainer: {
    paddingHorizontal: spacing.screen || 16,
    marginBottom: spacing.md || 12,
  },
  ecoTipsGradient: {
    padding: spacing.lg || 16,
    borderRadius: 20,
  },
  ecoTipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm || 8,
  },
  ecoTipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.green,
  },
  ecoTipsText: {
    fontSize: 14,
    color: fnpColors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md || 12,
    fontStyle: "italic",
  },
  ecoTipsBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ecoTipsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: fnpColors.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ecoTipsBadgeText: {
    fontSize: 12,
    color: fnpColors.green,
    fontWeight: "500",
  },

  // ===== INITIATIVES =====
  initiativeCard: {
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius || 20,
    padding: spacing.lg || 16,
    marginHorizontal: spacing.screen || 16,
    marginBottom: spacing.md || 12,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  initiativeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  initiativeIcon: {
    marginRight: spacing.md || 12,
  },
  initiativeIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initiativeTitle: {
    ...typography.h3,
    color: fnpColors.text,
    flex: 1,
    fontSize: 16,
  },
  initiativeContent: {
    marginTop: spacing.md || 12,
  },
  initiativeDesc: {
    ...typography.body,
    color: fnpColors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md || 12,
    fontSize: 14,
  },
  initiativeStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm || 8,
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  initiativeStatText: {
    ...typography.bodySmall,
    color: fnpColors.primary,
    fontWeight: "600",
    fontSize: 12,
  },

  // ===== PROGRESS =====
  progressSection: {
    paddingHorizontal: spacing.screen || 16,
    marginBottom: spacing.xl || 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: spacing.md || 12,
  },
  progressItem: {
    marginBottom: spacing.md || 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 13,
    color: fnpColors.textSecondary,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    color: fnpColors.primary,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    backgroundColor: fnpColors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: fnpColors.primary,
    borderRadius: 3,
  },

  // ===== CERTIFICATIONS =====
  certGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.screen || 16,
    gap: spacing.sm || 8,
    marginBottom: spacing.xl || 20,
  },
  certBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm || 8,
    backgroundColor: fnpColors.primaryLight,
    paddingHorizontal: spacing.md || 12,
    paddingVertical: spacing.md || 12,
    borderRadius: spacing.pillRadius || 25,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  certIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  certText: {
    ...typography.bodySmall,
    color: fnpColors.primaryDark,
    fontWeight: "600",
    fontSize: 12,
  },

  // ===== COMMITMENTS =====
  commitmentsCard: {
    backgroundColor: fnpColors.white,
    borderRadius: spacing.cardRadius || 20,
    padding: spacing.lg || 16,
    marginHorizontal: spacing.screen || 16,
    marginBottom: spacing.xl || 20,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  commitmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm || 8,
    marginBottom: spacing.md || 12,
  },
  commitmentIconWrap: {
    marginTop: 2,
  },
  commitmentText: {
    ...typography.body,
    color: fnpColors.textSecondary,
    flex: 1,
    lineHeight: 22,
    fontSize: 14,
  },

  // ===== CTA =====
  ctaSection: {
    marginHorizontal: spacing.screen || 16,
    marginBottom: spacing.xl || 20,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.medium,
  },
  ctaGradient: {
    padding: spacing.xl || 24,
    alignItems: "center",
  },
  ctaIconWrap: {
    marginBottom: spacing.md || 12,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: spacing.sm || 8,
  },
  ctaText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg || 16,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    ...shadows.medium,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: fnpColors.primary,
  },

  // ===== FOOTER =====
  footer: {
    paddingHorizontal: spacing.screen || 16,
    paddingTop: spacing.md || 12,
    paddingBottom: spacing.md || 12,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: fnpColors.textMuted,
    fontWeight: "500",
    marginBottom: spacing.sm || 8,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  footerLink: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  footerDot: {
    fontSize: 12,
    color: fnpColors.textMuted,
  },
});

// export default SustainabilityScreen;
