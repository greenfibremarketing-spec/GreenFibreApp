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
import { useNavigation } from "@react-navigation/native";
import gsap from "gsap";
import { aboutContent, aboutStats } from "../data/content";
import { placeholders } from "../data/images";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { StatCard } from "../components/common/StatCard";
import { SectionHeader } from "../components/common/SectionHeader";
import { Button } from "../components/common/Button";

const { width } = Dimensions.get("window");

// FNP Brand Colors (enhanced)
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#FFD700",
  goldLight: "#FFF8E1",
  success: "#4CAF50",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textMuted: "#999999",
  white: "#FFFFFF",
  cardBg: "#F8F9FA",
};

// Extended content (more FNP-like)
const extendedContent = {
  founder: {
    name: "Vikaas Gutgutia",
    role: "Founder & CEO",
    quote:
      "Every gift tells a story of love, care, and connection. We're not just delivering flowers—we're delivering emotions.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
  },
  impact: [
    { metric: "Happy Customers", value: "100k+", icon: "happy-outline" },
    { metric: "Eco Products", value: "500+", icon: "happy-outline" },
    { metric: "Trees Planted", value: "250k+", icon: "location-outline" },
    { metric: "Carbon Neutral", value: "100%", icon: "people-outline" },
  ],
  awards: [
    {
      name: "Best Gifting Brand 2024",
      icon: "trophy-outline",
      color: "#FFD700",
    },
    {
      name: "Customer Service Excellence",
      icon: "medal-outline",
      color: "#4CAF50",
    },
    {
      name: "Most Trusted Brand",
      icon: "shield-checkmark-outline",
      color: "#2196F3",
    },
  ],
  team: [
    {
      name: "Priya Sharma",
      role: "Head of Design",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    },
    {
      name: "Rahul Verma",
      role: "Operations Director",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    },
    {
      name: "Ananya Patel",
      role: "Customer Experience",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    },
    {
      name: "Vikram Singh",
      role: "Sustainability Lead",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    },
  ],
  testimonials: [
    {
      name: "Rajesh Sharma",
      text: "Green Fibre products exceeded our expectations. The quality is excellent, the eco-friendly approach is impressive, and the delivery was right on time.",
      rating: 5,
    },
    {
      name: "Priya Verma",
      text: "We purchased biodegradable products for our business, and the quality has been outstanding. Highly recommend Green Fibre for sustainable packaging solutions.",
      rating: 5,
    },
    {
      name: "Ankit Mehta",
      text: "Excellent customer service and premium-quality eco-friendly products. Green Fibre has become our trusted partner for sustainable packaging needs.",
      rating: 5,
    },
  ],
};

export function AboutScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("mission");
  const [showPledge, setShowPledge] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const scrollY = new Animated.Value(0);

  // Animation refs
  const heroRef = useRef({ opacity: 0, y: 30, scale: 0.95 });
  const [heroStyle, setHeroStyle] = useState({
    opacity: 0,
    y: 30,
    scale: 0.95,
  });

  const [statsStyles, setStatsStyles] = useState([]);

  useEffect(() => {
    // Hero animation
    const tween = gsap.to(heroRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1,
      ease: "power3.out",
      onUpdate: () => setHeroStyle({ ...heroRef.current }),
    });

    // Stats staggered animation
    const statTweens = aboutStats.map((_, i) => {
      const ref = { opacity: 0, y: 30 };
      const t = gsap.to(ref, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay: 0.3 + i * 0.15,
        ease: "power2.out",
        onUpdate: () => {
          setStatsStyles((prev) => {
            const newStyles = [...prev];
            newStyles[i] = {
              opacity: ref.opacity,
              transform: [{ translateY: ref.y }],
            };
            return newStyles;
          });
        },
      });
      return t;
    });

    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) =>
        prev === extendedContent.testimonials.length - 1 ? 0 : prev + 1,
      );
    }, 4000);

    return () => {
      tween.kill();
      statTweens.forEach((t) => t.kill());
      clearInterval(interval);
    };
  }, []);

  const renderStars = (rating) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => (
        <Ionicons key={i} name="star" size={16} color={fnpColors.gold} />
      ));
  };

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="About Us"
      headerRight={
        <TouchableOpacity
          onPress={() => navigation.navigate("Contact")}
          style={styles.headerAction}
        >
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={fnpColors.primary}
          />
        </TouchableOpacity>
      }
    >
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
      >
        {/* ===== HERO BANNER ===== */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1589533614927-49467b5e9f1b?w=1200",
          }}
          style={styles.heroBanner}
          imageStyle={styles.heroImage}
        >
          <View
            style={[
              styles.heroOverlay,
              {
                opacity: heroStyle.opacity,
                transform: [
                  { translateY: heroStyle.y },
                  { scale: heroStyle.scale },
                ],
              },
            ]}
          >
            <View style={styles.heroBadge}>
              <Ionicons
                name="ribbon-outline"
                size={16}
                color={fnpColors.gold}
              />
              <Text style={styles.heroBadgeText}>Est. 2020</Text>
            </View>
            <Text style={styles.heroTitle}>
              Spreading Smiles{"\n"}Since 2020 💐
            </Text>
            <Text style={styles.heroSubtitle}>
              Empowering a greener future through sustainable paper
              manufacturing and environmentally responsible packaging solutions.
            </Text>
            <TouchableOpacity
              style={styles.heroCTA}
              // onPress={() => navigation.navigate("Home")}
              onPress={() =>
                navigation.navigate("Tabs", {
                  screen: "Home",
                })
              }
            >
              <Text style={styles.heroCTAText}>Explore Our Story</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* ===== FOUNDER'S MESSAGE ===== */}
        <View style={styles.founderCard}>
          <View style={styles.founderImageWrap}>
            <Image
              source={{ uri: extendedContent.founder.image }}
              style={styles.founderImage}
              contentFit="cover"
            />
            <View style={styles.founderBadge}>
              <Ionicons name="chatbubble" size={20} color={fnpColors.white} />
            </View>
          </View>
          <View style={styles.founderContent}>
            <Text style={styles.founderName}>
              {extendedContent.founder.name}
            </Text>
            <Text style={styles.founderRole}>
              {extendedContent.founder.role}
            </Text>
            <Text style={styles.founderQuote}>
              "{extendedContent.founder.quote}"
            </Text>
          </View>
        </View>

        {/* ===== IMPACT METRICS ===== */}
        <SectionHeader
          title="Our Impact in Numbers"
          subtitle="Making a difference, one gift at a time"
        />
        <View style={styles.impactGrid}>
          {extendedContent.impact.map((item, i) => (
            <View
              key={i}
              style={[
                styles.impactCard,
                i === 0 ? styles.impactCardFirst : null,
              ]}
            >
              <View style={styles.impactIconWrap}>
                <Ionicons
                  name={item.icon}
                  size={28}
                  color={fnpColors.primary}
                />
              </View>
              <Text style={styles.impactValue}>{item.value}</Text>
              <Text style={styles.impactLabel}>{item.metric}</Text>
            </View>
          ))}
        </View>

        {/* ===== MISSION/VISION TABS ===== */}
        <SectionHeader title="Our Purpose" />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "mission" && styles.tabActive]}
            onPress={() => setActiveTab("mission")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "mission" && styles.tabTextActive,
              ]}
            >
              Mission
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "vision" && styles.tabActive]}
            onPress={() => setActiveTab("vision")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "vision" && styles.tabTextActive,
              ]}
            >
              Vision
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "values" && styles.tabActive]}
            onPress={() => setActiveTab("values")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "values" && styles.tabTextActive,
              ]}
            >
              Values
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "mission" && (
            <View>
              <Text style={styles.paragraph}>
                {aboutContent.missionText ||
                  "To make every moment special by providing the most beautiful, fresh, and thoughtfully curated gifts that create lasting memories."}
              </Text>
              <View style={styles.missionPoints}>
                <View style={styles.missionPoint}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={fnpColors.primary}
                  />
                  <Text style={styles.missionPointText}>
                    100% fresh flowers guaranteed
                  </Text>
                </View>
                <View style={styles.missionPoint}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={fnpColors.primary}
                  />
                  <Text style={styles.missionPointText}>
                    On-time delivery across India
                  </Text>
                </View>
                <View style={styles.missionPoint}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={fnpColors.primary}
                  />
                  <Text style={styles.missionPointText}>
                    Sustainable & eco-friendly packaging
                  </Text>
                </View>
              </View>
            </View>
          )}
          {activeTab === "vision" && (
            <View>
              <Text style={styles.paragraph}>
                To be the world's most loved gifting brand, connecting hearts
                across borders with innovation, quality, and unparalleled
                customer delight.
              </Text>
              <View style={styles.visionCard}>
                <Ionicons
                  name="rocket-outline"
                  size={32}
                  color={fnpColors.primary}
                />
                <Text style={styles.visionText}>
                  Expanding to 1000+ cities globally by 2030
                </Text>
              </View>
            </View>
          )}
          {activeTab === "values" && (
            <View>
              {aboutContent.values &&
                aboutContent.values.map((value, i) => (
                  <View key={i} style={styles.valueCard}>
                    <View style={styles.valueIcon}>
                      <Ionicons
                        name={
                          i === 0
                            ? "heart-outline"
                            : i === 1
                              ? "leaf-outline"
                              : "people-outline"
                        }
                        size={20}
                        color={fnpColors.primary}
                      />
                    </View>
                    <View style={styles.valueContent}>
                      <Text style={styles.valueTitle}>
                        {value.title || "Value"}
                      </Text>
                      <Text style={styles.valueDesc}>
                        {value.description || "Description"}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* ===== AWARDS ===== */}
        <SectionHeader
          title="Awards & Recognition"
          subtitle="We're proud to be recognized for our excellence"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.awardsScroll}
        >
          {extendedContent.awards.map((award, i) => (
            <View key={i} style={styles.awardCard}>
              <View
                style={[
                  styles.awardIcon,
                  { backgroundColor: award.color + "15" },
                ]}
              >
                <Ionicons name={award.icon} size={32} color={award.color} />
              </View>
              <Text style={styles.awardName}>{award.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ===== TEAM SHOWCASE ===== */}
        <SectionHeader
          title="Meet Our Team"
          subtitle="The passionate people behind the magic ✨"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.teamScroll}
        >
          {extendedContent.team.map((member, i) => (
            <TouchableOpacity key={i} style={styles.teamCard}>
              <Image
                source={{ uri: member.image }}
                style={styles.teamImage}
                contentFit="cover"
              />
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== TIMELINE ===== */}
        <SectionHeader
          title="Our Journey"
          subtitle="6 years of spreading happiness"
        />
        {aboutContent.timeline &&
          aboutContent.timeline.map((item, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineYear}>{item.year || "Year"}</Text>
                <Text style={styles.timelineTitle}>
                  {item.title || "Event"}
                </Text>
                <Text style={styles.timelineDesc}>
                  {item.description || "Description"}
                </Text>
              </View>
            </View>
          ))}

        {/* ===== TESTIMONIALS ===== */}
        <SectionHeader
          title="What Our Customers Say"
          subtitle="Real stories from real people"
        />
        <View style={styles.testimonialCard}>
          <View style={styles.testimonialStars}>
            {renderStars(
              extendedContent.testimonials[currentTestimonial].rating,
            )}
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
            <Ionicons name="leaf-outline" size={28} color={fnpColors.success} />
            <Text style={styles.pledgeTitle}>Sustainability Pledge</Text>
          </View>
          <Text style={styles.pledgeText}>
            We're committed to reducing our environmental footprint through
            eco-friendly packaging, sustainable sourcing, and carbon-neutral
            delivery.
          </Text>
          <TouchableOpacity
            style={[
              styles.pledgeButton,
              showPledge && styles.pledgeButtonActive,
            ]}
            onPress={() => setShowPledge(!showPledge)}
          >
            <Ionicons
              name={showPledge ? "checkmark-circle" : "checkbox-outline"}
              size={20}
              color={showPledge ? fnpColors.white : fnpColors.primary}
            />
            <Text
              style={[
                styles.pledgeButtonText,
                showPledge && styles.pledgeButtonTextActive,
              ]}
            >
              {showPledge ? "Pledged ✓" : "Take the Pledge"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== CTA SECTION ===== */}
        <View style={styles.ctaSection}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600",
            }}
            style={styles.ctaImage}
            contentFit="cover"
          />
          <View style={styles.ctaOverlay}>
            <Text style={styles.ctaTitle}>Be Part of Our Story</Text>
            <Text style={styles.ctaText}>
              Join millions of happy customers who trust us with their special
              moments.
            </Text>
            <Button
              title="Get Started 🎁"
              onPress={() => navigation.navigate("Home")}
              style={styles.ctaButton}
            />
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 GreeenFibre. Made with ❤️ in India
          </Text>
        </View>
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },

  // ===== HERO =====
  heroBanner: {
    height: 400,
    marginHorizontal: spacing.screen,
    marginTop: spacing.md,
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: spacing.cardRadius,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: spacing.xl,
    justifyContent: "center",
    borderRadius: spacing.cardRadius,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,215,0,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: fnpColors.gold,
  },
  heroBadgeText: {
    color: fnpColors.gold,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: spacing.xs,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: colors.white,
    lineHeight: 42,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  heroCTA: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: fnpColors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 30,
    gap: spacing.sm,
  },
  heroCTAText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },

  // ===== FOUNDER =====
  founderCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginHorizontal: spacing.screen,
    marginVertical: spacing.lg,
    ...shadows.medium,
  },
  founderImageWrap: {
    position: "relative",
    marginRight: spacing.md,
  },
  founderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  founderBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: fnpColors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  founderContent: {
    flex: 1,
    justifyContent: "center",
  },
  founderName: {
    ...typography.h3,
    color: colors.text,
    fontWeight: "700",
  },
  founderRole: {
    ...typography.bodySmall,
    color: fnpColors.primary,
    marginBottom: spacing.xs,
  },
  founderQuote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
  },

  // ===== IMPACT =====
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  impactCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    alignItems: "center",
    ...shadows.soft,
  },
  impactCardFirst: {
    minWidth: "100%",
  },
  impactIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: fnpColors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  impactValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
  impactLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },

  // ===== TABS =====
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.screen,
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 28,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: colors.white,
    ...shadows.soft,
  },
  tabText: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tabTextActive: {
    color: fnpColors.primary,
    fontWeight: "600",
  },
  tabContent: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  missionPoints: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  missionPoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  missionPointText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  visionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: fnpColors.primaryLight,
    padding: spacing.lg,
    borderRadius: spacing.cardRadius,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  visionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    fontWeight: "500",
  },

  // ===== AWARDS =====
  awardsScroll: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  awardCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginRight: spacing.md,
    alignItems: "center",
    width: 140,
    ...shadows.soft,
  },
  awardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  awardName: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: "center",
    fontWeight: "500",
  },

  // ===== TEAM =====
  teamScroll: {
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  teamCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.md,
    marginRight: spacing.md,
    alignItems: "center",
    width: 130,
    ...shadows.soft,
  },
  teamImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  teamName: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    textAlign: "center",
  },
  teamRole: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
  },

  // ===== TIMELINE =====
  timelineItem: {
    flexDirection: "row",
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: fnpColors.primary,
    marginTop: 4,
    marginRight: spacing.lg,
  },
  timelineContent: {
    flex: 1,
  },
  timelineYear: {
    ...typography.caption,
    color: fnpColors.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  timelineTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timelineDesc: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // ===== TESTIMONIALS =====
  testimonialCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.xl,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
    alignItems: "center",
    ...shadows.medium,
  },
  testimonialStars: {
    flexDirection: "row",
    marginBottom: spacing.md,
    gap: 2,
  },
  testimonialText: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  testimonialName: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  testimonialDots: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: 8,
  },
  testimonialDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  testimonialDotActive: {
    backgroundColor: fnpColors.primary,
    width: 20,
  },

  // ===== PLEDGE =====
  pledgeCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: spacing.cardRadius,
    padding: spacing.xl,
    marginHorizontal: spacing.screen,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  pledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pledgeTitle: {
    ...typography.h3,
    color: colors.text,
  },
  pledgeText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  pledgeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: fnpColors.primary,
  },
  pledgeButtonActive: {
    backgroundColor: fnpColors.success,
    borderColor: fnpColors.success,
  },
  pledgeButtonText: {
    ...typography.body,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  pledgeButtonTextActive: {
    color: colors.white,
  },

  // ===== CTA SECTION =====
  ctaSection: {
    marginHorizontal: spacing.screen,
    marginVertical: spacing.xl,
    borderRadius: spacing.cardRadius,
    overflow: "hidden",
    ...shadows.medium,
  },
  ctaImage: {
    width: "100%",
    height: 200,
  },
  ctaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  ctaTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  ctaText: {
    ...typography.body,
    color: "rgba(255,255,255,0.85)",
    marginBottom: spacing.md,
  },
  ctaButton: {
    alignSelf: "flex-start",
  },

  // ===== FOOTER =====
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },

  // ===== EXISTING STYLES =====
  headerAction: {
    padding: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  valueCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: spacing.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  valueContent: { flex: 1 },
  valueTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  valueDesc: {
    ...typography.bodySmall,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
