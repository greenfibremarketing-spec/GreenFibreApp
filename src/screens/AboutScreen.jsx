// src/screens/AboutScreen.jsx
// Green Fibre — Premium Brand Story & Purpose

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { aboutContent, aboutStats, brand } from "../data/content";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/common/Button";

const { width } = Dimensions.get("window");

const extendedContent = {
  impact: [
    { metric: "Happy Customers", value: "50k+", icon: "happy-outline" },
    { metric: "Eco Products", value: "200+", icon: "leaf-outline" },
    { metric: "Trees Planted", value: "100k+", icon: "earth-outline" },
    { metric: "Plastic Saved", value: "10 Tons", icon: "sync-outline" },
  ],
  awards: [
    {
      name: "Sustainable Brand 2025",
      icon: "trophy-outline",
      color: "#D4A843",
    },
    {
      name: "Eco Innovation Award",
      icon: "medal-outline",
      color: colors.primary,
    },
    {
      name: "Zero Plastic Champion",
      icon: "shield-checkmark-outline",
      color: "#33691E",
    },
  ],
  testimonials: [
    {
      name: "Aditi Rao",
      text: "Green Fibre's sustainable products exceeded all my expectations. Beautiful design, authentic materials, and plastic-free packaging.",
      rating: 5,
    },
    {
      name: "Sameer Joshi",
      text: "We replaced our office supplies with bamboo and recycled stationery. Top-tier quality and prompt delivery.",
      rating: 5,
    },
    {
      name: "Kavita Nair",
      text: "The living plantable seed paper products are wonderful. It's rewarding to see products grow into plants!",
      rating: 5,
    },
  ],
};

export function AboutScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("mission");
  const [showPledge, setShowPledge] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setCurrentTestimonial((prev) =>
        prev === extendedContent.testimonials.length - 1 ? 0 : prev + 1,
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => (
        <Ionicons key={i} name="star" size={15} color="#D4A843" />
      ));
  };

  return (
    <ScreenContainer
      onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      headerTitle="About Us"
      scroll={true}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* ===== HERO BANNER ===== */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80",
          }}
          style={styles.heroBanner}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroBadge}>
              <Ionicons name="leaf" size={14} color={colors.primaryLight} />
              <Text style={styles.heroBadgeText}>EST. 2024</Text>
            </View>
            <Text style={styles.heroTitle}>Living in Harmony{"\n"}With Nature 🌿</Text>
            <Text style={styles.heroSubtitle}>
              Empowering a sustainable lifestyle through 100% biodegradable,
              plant-based products and zero-waste craftsmanship.
            </Text>
            <TouchableOpacity
              style={styles.heroCTA}
              onPress={() => navigation.navigate("Tabs", { screen: "Shop" })}
              activeOpacity={0.85}
            >
              <Text style={styles.heroCTAText}>Explore Products</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* ===== IMPACT METRICS ===== */}
        <SectionHeader
          title="Our Sustainable Impact"
          subtitle="Real change created with every conscious choice"
        />
        <View style={styles.impactGrid}>
          {extendedContent.impact.map((item, i) => (
            <View key={i} style={styles.impactCard}>
              <View style={styles.impactIconWrap}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.impactValue}>{item.value}</Text>
              <Text style={styles.impactLabel}>{item.metric}</Text>
            </View>
          ))}
        </View>

        {/* ===== PURPOSE TABS ===== */}
        <SectionHeader title="Our Purpose" />
        <View style={styles.tabContainer}>
          {["mission", "vision", "values"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {activeTab === "mission" && (
            <View style={styles.cardBox}>
              <Text style={styles.paragraph}>
                {aboutContent.missionText ||
                  "To replace single-use plastic with biodegradable, beautifully handcrafted bamboo, paper, and botanical essentials for conscious living."}
              </Text>
              <View style={styles.missionPoints}>
                <View style={styles.missionPoint}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.missionPointText}>100% Certified Eco-Friendly</Text>
                </View>
                <View style={styles.missionPoint}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.missionPointText}>Zero Plastic in Packaging & Dispatch</Text>
                </View>
                <View style={styles.missionPoint}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={styles.missionPointText}>Ethically Sourced from Local Artisans</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === "vision" && (
            <View style={styles.cardBox}>
              <Text style={styles.paragraph}>
                To pioneer India's most trusted green lifestyle movement,
                inspiring 10 million households to transition toward mindful, zero-waste living.
              </Text>
              <View style={styles.visionCard}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
                <Text style={styles.visionText}>
                  Saving 100+ tons of plastic landfill waste by 2027
                </Text>
              </View>
            </View>
          )}

          {activeTab === "values" && (
            <View style={styles.valuesList}>
              {(aboutContent.values || [
                { title: "Sustainability First", description: "Every product is vetted for pure ecological footprint." },
                { title: "Artisan Empowerment", description: "Direct collaboration with rural craftspeople and fair wages." },
                { title: "Uncompromising Quality", description: "Functional, durable, and naturally aesthetic goods." },
              ]).map((value, i) => (
                <View key={i} style={styles.valueCard}>
                  <View style={styles.valueIcon}>
                    <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.valueContent}>
                    <Text style={styles.valueTitle}>{value.title}</Text>
                    <Text style={styles.valueDesc}>{value.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ===== AWARDS ===== */}
        <SectionHeader
          title="Recognition & Certifications"
          subtitle="Honored for our environmental commitments"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.awardsScroll}
          contentContainerStyle={{ paddingHorizontal: spacing.screen }}
        >
          {extendedContent.awards.map((award, i) => (
            <View key={i} style={styles.awardCard}>
              <View style={[styles.awardIcon, { backgroundColor: award.color + "18" }]}>
                <Ionicons name={award.icon} size={28} color={award.color} />
              </View>
              <Text style={styles.awardName}>{award.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ===== TESTIMONIALS ===== */}
        <SectionHeader
          title="Community Voices"
          subtitle="Thoughts from our green community"
        />
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialStars}>
            {renderStars(extendedContent.testimonials[currentTestimonial].rating)}
          </View>
          <Text style={styles.testimonialText}>
            "{extendedContent.testimonials[currentTestimonial].text}"
          </Text>
          <Text style={styles.testimonialName}>
            — {extendedContent.testimonials[currentTestimonial].name}
          </Text>
          <View style={styles.testimonialDots}>
            {extendedContent.testimonials.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.testimonialDot,
                  i === currentTestimonial && styles.testimonialDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* ===== SUSTAINABILITY PLEDGE ===== */}
        <View style={styles.pledgeCard}>
          <View style={styles.pledgeHeader}>
            <Ionicons name="leaf" size={24} color={colors.primary} />
            <Text style={styles.pledgeTitle}>The Green Fibre Pledge</Text>
          </View>
          <Text style={styles.pledgeText}>
            Every order placed contributes directly to our tree plantation drives and community clean-up initiatives.
          </Text>
          <TouchableOpacity
            style={[styles.pledgeButton, showPledge && styles.pledgeButtonActive]}
            onPress={() => setShowPledge(!showPledge)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={showPledge ? "checkmark-circle" : "shield-checkmark-outline"}
              size={18}
              color={showPledge ? "#FFFFFF" : colors.primary}
            />
            <Text
              style={[
                styles.pledgeButtonText,
                showPledge && styles.pledgeButtonTextActive,
              ]}
            >
              {showPledge ? "Pledge Taken ✓" : "Take the Green Pledge"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 {brand.name || "Green Fibre"}. Handcrafted sustainably.
          </Text>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  heroBanner: {
    height: 340,
    marginHorizontal: spacing.screen,
    marginTop: spacing.sm,
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: spacing.cardRadius,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(18, 46, 26, 0.68)",
    padding: spacing.xl,
    justifyContent: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: spacing.md,
    gap: 6,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "DMMono_500Medium",
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.88)",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  heroCTAText: {
    color: "#FFFFFF",
    fontFamily: "DMSans_600SemiBold",
    fontSize: 13,
  },

  // Impact
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.lg,
  },
  impactCard: {
    flex: 1,
    minWidth: "46%",
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 16,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight || "rgba(28, 74, 42, 0.08)",
  },
  impactIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface || "#F0F7F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  impactValue: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay_700Bold",
    color: colors.textPrimary || "#1A1A1A",
  },
  impactLabel: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: colors.textSecondary || "#6B6B6B",
    textAlign: "center",
    marginTop: 2,
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.screen,
    backgroundColor: colors.creamDark || "#EDE8DF",
    borderRadius: 24,
    padding: 3,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.surface || "#FFFFFF",
  },
  tabText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: colors.textMuted || "#9E9E9E",
  },
  tabTextActive: {
    color: colors.primary,
    fontFamily: "DMSans_600SemiBold",
  },
  tabContent: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  cardBox: {
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight || "rgba(28, 74, 42, 0.08)",
  },
  paragraph: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: colors.textSecondary || "#4A4A4A",
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  missionPoints: {
    gap: 8,
  },
  missionPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  missionPointText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: colors.textPrimary || "#2C2C2C",
  },
  visionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySurface || "#F0F7F1",
    padding: spacing.md,
    borderRadius: 12,
    gap: 12,
  },
  visionText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: colors.primary,
    flex: 1,
  },
  valuesList: {
    gap: 10,
  },
  valueCard: {
    flexDirection: "row",
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight || "rgba(28, 74, 42, 0.08)",
    alignItems: "center",
  },
  valueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySurface || "#F0F7F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  valueContent: { flex: 1 },
  valueTitle: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: colors.textPrimary || "#1A1A1A",
    marginBottom: 2,
  },
  valueDesc: {
    fontSize: 12,
    fontFamily: "DMSans_400Regular",
    color: colors.textSecondary || "#666666",
    lineHeight: 18,
  },

  // Awards
  awardsScroll: {
    marginBottom: spacing.xl,
  },
  awardCard: {
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    marginRight: 10,
    alignItems: "center",
    width: 130,
    borderWidth: 1,
    borderColor: colors.borderLight || "rgba(28, 74, 42, 0.08)",
  },
  awardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  awardName: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
    color: colors.textPrimary || "#1A1A1A",
    textAlign: "center",
  },

  // Testimonials
  testimonialCard: {
    backgroundColor: colors.surface || "#FFFFFF",
    borderRadius: 16,
    padding: spacing.xl,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight || "rgba(28, 74, 42, 0.08)",
  },
  testimonialStars: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    gap: 3,
  },
  testimonialText: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: colors.textPrimary || "#2C2C2C",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  testimonialName: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: colors.primary,
  },
  testimonialDots: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: 6,
  },
  testimonialDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0D0D0",
  },
  testimonialDotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },

  // Pledge
  pledgeCard: {
    backgroundColor: colors.primarySurface || "#F0F7F1",
    borderRadius: 16,
    padding: spacing.lg,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 42, 0.15)",
  },
  pledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  pledgeTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: colors.primary,
  },
  pledgeText: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: colors.textSecondary || "#4A4A4A",
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  pledgeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface || "#FFFFFF",
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  pledgeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pledgeButtonText: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: colors.primary,
  },
  pledgeButtonTextActive: {
    color: "#FFFFFF",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  footerText: {
    fontSize: 11,
    fontFamily: "DMSans_400Regular",
    color: colors.textMuted || "#9E9E9E",
  },
});
