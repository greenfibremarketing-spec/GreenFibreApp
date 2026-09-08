// src/screens/ContactScreen.jsx
// Green Fibre — Premium editorial contact layout
// Studio photo top, warm intro, WhatsApp as distinct pill CTA

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { contactContent, brand } from "../data/content";
import { colors, spacing } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { contactService } from "../api/services/contactService";

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
    if (!form.fullName.trim() || !form.email.trim() || !form.message.trim()) {
      Alert.alert("Please complete the form", "Name, email and message are required.");
      return;
    }
    setLoading(true);
    try {
      await contactService.submitContactForm(form);
      Alert.alert(
        "Message sent",
        "Thank you for reaching out. We'll reply within one working day.",
        [{ text: "Done", onPress: () => setForm({ fullName: "", email: "", phone: "", message: "" }) }],
      );
    } catch (e) {
      Alert.alert(
        "Couldn't send",
        e instanceof Error ? e.message : "Please try again or reach us on WhatsApp.",
      );
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const phone = brand?.supportPhone || "+919876543210";
    const msg = encodeURIComponent("Hi Green Fibre! I'd like to know more about your products.");
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`),
    );
  };

  const openEmail = () =>
    Linking.openURL(`mailto:${brand?.supportEmail || "support@greenfibre.com"}`);

  const callUs = () =>
    Linking.openURL(`tel:${brand?.supportPhone || "+919876543210"}`);

  return (
    <ScreenContainer onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>

        {/* ── STUDIO PHOTO ─────────────────────────────────── */}
        <View style={styles.studioPhoto}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=80" }}
            style={styles.studioImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["transparent", colors.background]}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.studioOverlay}>
            <Text style={styles.studioOverline}>GET IN TOUCH</Text>
            <Text style={styles.studioTitle}>We'd love to{"\n"}hear from you</Text>
          </View>
        </View>

        {/* ── CONTACT BODY ─────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.body}>

          {/* Warm intro */}
          <Text style={styles.intro}>
            Our small team is based in India and typically replies within one working day. 
            For urgent enquiries, WhatsApp is fastest.
          </Text>

          {/* ── WHATSAPP PILL — PROMINENT ─────────────────── */}
          <Button
            title="Chat on WhatsApp"
            variant="whatsapp"
            fullWidth
            onPress={openWhatsApp}
            icon={<Ionicons name="logo-whatsapp" size={20} color="#fff" />}
            style={styles.whatsappBtn}
          />

          {/* ── SECONDARY CONTACT LINKS ───────────────────── */}
          <View style={styles.contactLinks}>
            <TouchableOpacity style={styles.contactLink} onPress={callUs}>
              <Ionicons name="call-outline" size={16} color={colors.primary} />
              <Text style={styles.contactLinkText}>
                {brand?.supportPhone || "+91 98765 43210"}
              </Text>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity style={styles.contactLink} onPress={openEmail}>
              <Ionicons name="mail-outline" size={16} color={colors.primary} />
              <Text style={styles.contactLinkText}>
                {brand?.supportEmail || "support@greenfibre.com"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── DIVIDER ───────────────────────────────────── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or send a message</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── CONTACT FORM ──────────────────────────────── */}
          <Input
            label="Your name"
            value={form.fullName}
            onChangeText={(t) => setForm((f) => ({ ...f, fullName: t }))}
            placeholder="Priya Sharma"
            icon="person-outline"
            required
          />
          <Input
            label="Email address"
            value={form.email}
            onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
            placeholder="priya@email.com"
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
            placeholder="+91 9876543210"
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <Input
            label="Message"
            value={form.message}
            onChangeText={(t) => setForm((f) => ({ ...f, message: t }))}
            placeholder="Tell us how we can help…"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            style={{ paddingTop: 14, minHeight: 120 }}
            required
          />

          <Button
            title="Send message"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            style={styles.sendBtn}
          />

          {/* ── OFFICE NOTE ───────────────────────────────── */}
          <View style={styles.officeNote}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.officeNoteText}>
              Green Fibre · Made in India · Replies in 1 working day
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Studio photo top ─────────────────────────────────────
  studioPhoto: {
    height: 280,
    position: "relative",
    backgroundColor: colors.primaryDark,
  },
  studioImage: {
    width: "100%",
    height: "100%",
  },
  studioOverlay: {
    position: "absolute",
    bottom: 28,
    left: 24,
  },
  studioOverline: {
    fontFamily: "DMMono_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.cream,
    opacity: 0.7,
    marginBottom: 8,
  },
  studioTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 30,
    lineHeight: 38,
    color: colors.cream,
  },

  // ── Body ────────────────────────────────────────────────
  body: {
    padding: spacing.screen,
    paddingTop: 28,
    paddingBottom: 60,
  },
  intro: {
    fontFamily: "DMSans_400Regular",
    fontSize: 15,
    lineHeight: 25,
    color: colors.textSecondary,
    marginBottom: 24,
  },

  // ── WhatsApp CTA ─────────────────────────────────────────
  whatsappBtn: {
    marginBottom: 20,
  },

  // ── Contact links ────────────────────────────────────────
  contactLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    marginBottom: 32,
  },
  contactLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    justifyContent: "center",
  },
  contactLinkText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 13,
    color: colors.primary,
  },
  linkDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
  },

  // ── Section divider ─────────────────────────────────────
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontFamily: "DMMono_400Regular",
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },

  // ── Send button ──────────────────────────────────────────
  sendBtn: {
    marginTop: 8,
    marginBottom: 24,
  },

  // ── Office note ──────────────────────────────────────────
  officeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 8,
  },
  officeNoteText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
});
