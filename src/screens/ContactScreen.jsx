import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { contactContent, brand } from "../data/content";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { SectionHeader } from "../components/common/SectionHeader";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { contactService } from "../api/services/contactService";

// FNP Brand Colors (enhanced)
const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  gold: "#FFD700",
  goldLight: "#FFF8E1",
  success: "#4CAF50",
  whatsapp: "#25D366",
};

export function ContactScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await contactService.submitContactForm(form);
      Alert.alert(
        "🎉 Message Sent!",
        "Thank you for reaching out! We'll get back to you within 24 hours.",
        [{ text: "OK", onPress: () => resetForm() }],
      );
    } catch (e) {
      Alert.alert(
        "❌ Error",
        e instanceof Error
          ? e.message
          : "Failed to send message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ fullName: "", email: "", phone: "", message: "" });
  };

  // Quick contact actions
  const quickActions = [
    {
      id: "call",
      icon: "call-outline",
      label: "Call Us",
      value: brand?.supportPhone || "+91-98765-43210",
      color: fnpColors.primary,
      action: () =>
        Linking.openURL(`tel:${brand?.supportPhone || "+919876543210"}`),
    },
    {
      id: "whatsapp",
      icon: "logo-whatsapp",
      label: "WhatsApp",
      value: "Chat with us",
      color: fnpColors.whatsapp,
      action: () =>
        Linking.openURL(
          `whatsapp://send?phone=${brand?.supportPhone || "+919876543210"}&text=Hi! I need help with my order.`,
        ),
    },
    {
      id: "email",
      icon: "mail-outline",
      label: "Email",
      value: brand?.supportEmail || "support@greenfibre.com",
      color: fnpColors.primaryDark,
      action: () =>
        Linking.openURL(
          `mailto:${brand?.supportEmail || "support@greenfibre.com"}`,
        ),
    },
    // {
    //   id: "chat",
    //   icon: "chatbubble-outline",
    //   label: "Live Chat",
    //   value: "Available 24/7",
    //   color: "#FF6F00",
    //   action: () => Alert.alert("Live Chat", "Our team is ready to help you!"),
    // },
  ];

  // Social media links
  // const socialLinks = [
  //   { id: "instagram", icon: "logo-instagram", color: "#E4405F" },
  //   { id: "facebook", icon: "logo-facebook", color: "#1877F2" },
  //   { id: "youtube", icon: "logo-youtube", color: "#FF0000" },
  //   { id: "twitter", icon: "logo-twitter", color: "#1DA1F2" },
  // ];
  const socialLinks = [
    {
      id: "instagram",
      icon: "logo-instagram",
      color: "#E4405F",
      url: "https://www.instagram.com/your_username",
    },
    {
      id: "facebook",
      icon: "logo-facebook",
      color: "#1877F2",
      url: "https://www.facebook.com/your_page",
    },
    {
      id: "youtube",
      icon: "logo-youtube",
      color: "#FF0000",
      url: "https://www.youtube.com/@your_channel",
    },
    {
      id: "twitter",
      icon: "logo-twitter",
      color: "#1DA1F2",
      url: "https://x.com/your_username",
    },
  ];
  const openSocialLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open the link.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // Business hours with status
  const getBusinessStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    // Assuming 9 AM - 9 PM, 7 days a week
    if (hour >= 9 && hour < 21) {
      return {
        status: "Open Now",
        color: fnpColors.success,
        icon: "time-outline",
      };
    }
    return { status: "Closed", color: "#FF5252", icon: "time-outline" };
  };

  const businessStatus = getBusinessStatus();

  // Safe data access with fallbacks
  const contactTitle = contactContent?.title || "Get in Touch";
  const contactSubtitle =
    contactContent?.subtitle || "We love hearing from you!";
  const businessHours = contactContent?.businessHours || [
    { day: "Monday - Friday", hours: "9:00 AM - 9:00 PM" },
    { day: "Saturday - Sunday", hours: "10:00 AM - 8:00 PM" },
  ];

  return (
    <ScreenContainer
      onMenuPress={() => navigation.openDrawer()}
      headerTitle="Contact Us"
      headerRight={
        <TouchableOpacity
          onPress={() => Alert.alert("FAQ", "Frequently Asked Questions")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="help-circle-outline"
            size={24}
            color={fnpColors.primary}
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ===== HERO BANNER ===== */}
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1589533614927-49467b5e9f1b?w=800",
          }}
          style={styles.heroBanner}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>💐 We're Here to Help!</Text>
            <Text style={styles.heroSubtitle}>
              Got questions about your order, gifts, or delivery? Reach out to
              us anytime.
            </Text>
          </View>
        </ImageBackground>

        {/* ===== SECTION HEADER ===== */}
        <View style={styles.sectionHeaderContainer}>
          <SectionHeader title={contactTitle} subtitle={contactSubtitle} />
        </View>

        {/* ===== QUICK CONTACT CARDS ===== */}
        <View style={styles.quickActionsGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.quickActionCard, { borderColor: item.color }]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: item.color + "15" },
                ]}
              >
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
              <Text style={styles.quickActionValue} numberOfLines={1}>
                {item.value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== BUSINESS HOURS CARD ===== */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <View style={styles.hoursTitleRow}>
              <Ionicons
                name="business-outline"
                size={24}
                color={fnpColors.primary}
              />
              <Text style={styles.hoursCardTitle}>Business Hours</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: businessStatus.color + "15" },
              ]}
            >
              <Ionicons
                name={businessStatus.icon}
                size={14}
                color={businessStatus.color}
              />
              <Text
                style={[styles.statusText, { color: businessStatus.color }]}
              >
                {businessStatus.status}
              </Text>
            </View>
          </View>

          {businessHours.map((h, i) => (
            <View key={i} style={styles.hoursRow}>
              <Text style={styles.hoursDay}>{h.day}</Text>
              <Text style={styles.hoursTime}>{h.hours}</Text>
            </View>
          ))}
        </View>

        {/* ===== SOCIAL MEDIA ===== */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us for Updates 🎁</Text>

          <View style={styles.socialGrid}>
            {socialLinks.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.socialButton,
                  { backgroundColor: item.color + "10" },
                ]}
                onPress={() => openSocialLink(item.url)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={30} color={item.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ===== FORM CARD ===== */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Ionicons
              name="create-outline"
              size={24}
              color={fnpColors.primary}
            />
            <Text style={styles.formTitle}>Send Us a Message</Text>
          </View>
          <Text style={styles.formSubtitle}>
            Fill in the details below, and we'll get back to you shortly.
          </Text>

          <Input
            label="Full Name"
            value={form.fullName}
            onChangeText={(v) => setForm({ ...form, fullName: v })}
            required
            icon="person-outline"
            placeholder="Enter your full name"
          />

          <Input
            label="Email Address"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            required
            keyboardType="email-address"
            icon="mail-outline"
            placeholder="your@email.com"
          />

          <Input
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
            icon="call-outline"
            placeholder="+91-98765-43210"
          />

          <Input
            label="Message"
            value={form.message}
            onChangeText={(v) => setForm({ ...form, message: v })}
            required
            multiline
            numberOfLines={5}
            style={styles.textArea}
            placeholder="Tell us how we can help you..."
          />

          <Button
            title="Send Message 💌"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>

        {/* ===== FOOTER INFO ===== */}
        <View style={styles.footerNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={colors.textMuted || "#999"}
          />
          <Text style={styles.footerText}>
            We typically respond within 24 hours. Your privacy matters to us.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing?.xxxl || 40,
  },

  // ===== HERO =====
  heroBanner: {
    height: 180,
    marginHorizontal: spacing?.screen || 16,
    marginTop: spacing?.md || 12,
    borderRadius: spacing?.cardRadius || 20,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: spacing?.cardRadius || 20,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: "rgba(233, 30, 99, 0.75)",
    padding: spacing?.xl || 24,
    justifyContent: "center",
    borderRadius: spacing?.cardRadius || 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: spacing?.xs || 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    lineHeight: 20,
  },

  // ===== SECTION =====
  sectionHeaderContainer: {
    marginTop: spacing?.lg || 16,
    marginBottom: spacing?.md || 12,
  },

  // ===== QUICK ACTIONS =====
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: spacing?.screen || 16,
    gap: spacing?.md || 12,
    marginBottom: spacing?.lg || 16,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: spacing?.cardRadius || 20,
    padding: spacing?.md || 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing?.xs || 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  quickActionValue: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
  },

  // ===== HOURS CARD =====
  hoursCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: spacing?.cardRadius || 20,
    padding: spacing?.xl || 24,
    marginHorizontal: spacing?.screen || 16,
    marginBottom: spacing?.lg || 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hoursHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing?.md || 12,
  },
  hoursTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing?.sm || 8,
  },
  hoursCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 0,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing?.md || 12,
    paddingVertical: spacing?.xs || 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  hoursDay: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  hoursTime: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },

  // ===== SOCIAL =====
  socialSection: {
    marginHorizontal: spacing?.screen || 16,
    marginBottom: spacing?.lg || 16,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: spacing?.md || 12,
  },
  socialGrid: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing?.lg || 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  // ===== FORM =====
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: spacing?.cardRadius || 20,
    padding: spacing?.xl || 24,
    marginHorizontal: spacing?.screen || 16,
    marginBottom: spacing?.lg || 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing?.sm || 8,
    marginBottom: spacing?.xs || 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 0,
  },
  formSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: spacing?.lg || 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: spacing?.md || 12,
  },
  submitButton: {
    marginTop: spacing?.md || 12,
    backgroundColor: fnpColors.primary,
  },

  // ===== FOOTER =====
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing?.xs || 4,
    marginHorizontal: spacing?.screen || 16,
    paddingVertical: spacing?.md || 12,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
