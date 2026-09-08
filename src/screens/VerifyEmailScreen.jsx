// src/screens/VerifyEmailScreen.jsx
// Green Fibre — Smooth, Blink-Free OTP Verification Screen

import React, { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../components/common/Button";
import { greenFibreAuthService } from "../api/services/greenFibreAuthService";
import { hasAuthCookie } from "../api/cookieJar";
import { maskEmail } from "../utils/authUser";
import { useAppDispatch } from "../store/hooks";
import { completeAuthentication } from "../store/thunks/authThunks";
import { syncSessionAfterAuth } from "../store/thunks/sessionSyncThunks";
import { showToast } from "../store/slices/uiSlice";
import { colors, spacing } from "../theme";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const theme = {
  primary: colors.primary || "#1C4A2A",
  primaryDark: colors.primaryDark || "#122E1A",
  primaryLight: colors.primarySurface || "#F0F7F1",
  text: colors.textPrimary || "#1A1A1A",
  textSecondary: colors.textSecondary || "#666666",
  textMuted: colors.textMuted || "#999999",
  danger: colors.error || "#F44336",
  borderLight: "#E0E0E0",
  cream: colors.cream || "#FAF7F0",
  white: "#FFFFFF",
};

function getVerifyErrorMessage(error) {
  const code = error?.code;
  const attemptsRemaining = error?.data?.attemptsRemaining;

  switch (code) {
    case "OTP_INVALID":
      if (typeof attemptsRemaining === "number") {
        return attemptsRemaining > 0
          ? `Invalid code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? "" : "s"} remaining.`
          : "Invalid code. Please request a new verification code.";
      }
      return error.message || "Invalid verification code.";
    case "OTP_EXPIRED":
      return "This verification code has expired. Please request a new code.";
    case "OTP_MAX_ATTEMPTS":
      return "Maximum attempts reached. Please request a new verification code.";
    case "OTP_MISSING":
      return "No verification code found. Please request a new code.";
    case "ALREADY_VERIFIED":
      return "This email is already verified. Please sign in.";
    default:
      return error?.message || "Unable to verify your email right now.";
  }
}

// ── Isolated Resend Timer Component (prevents full screen re-render every second) ──
const ResendTimerSection = memo(function ResendTimerSection({
  onResend,
  resending,
  initialCooldown = RESEND_COOLDOWN_SECONDS,
}) {
  const [countdown, setCountdown] = useState(initialCooldown);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePress = async () => {
    if (countdown > 0 || resending) return;
    const success = await onResend();
    if (success) {
      setCountdown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <View style={styles.resendSection}>
      <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
      {countdown > 0 ? (
        <View style={styles.countdownPill}>
          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
          <Text style={styles.countdownText}>
            Resend code in {countdown}s
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePress}
          disabled={resending}
          activeOpacity={0.7}
          style={styles.resendButton}
        >
          <Ionicons name="refresh-outline" size={16} color={theme.primary} />
          <Text style={styles.resendLink}>
            {resending ? "Sending..." : "Resend verification code"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

export function VerifyEmailScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const email = route.params?.email?.trim().toLowerCase() || "";

  const [otpCode, setOtpCode] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const masterInputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!email) {
      navigation.replace("Register");
    }
  }, [email, navigation]);

  // Auto focus master input smoothly on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      masterInputRef.current?.focus();
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (value) => {
    const sanitized = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtpCode(sanitized);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== OTP_LENGTH) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const verifyResult = await greenFibreAuthService.verifyOtp({
        email,
        otp: otpCode,
      });

      await dispatch(completeAuthentication(verifyResult?.user || verifyResult?.data?.user)).unwrap();
      dispatch(syncSessionAfterAuth());

      dispatch(
        showToast({
          message: "Email verified successfully. Welcome to Green Fibre!",
          type: "success",
        }),
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (error) {
      if (error?.code === "ALREADY_VERIFIED") {
        dispatch(
          showToast({
            message: "Your email is already verified. Please sign in.",
            type: "success",
          }),
        );
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      setErrorMessage(getVerifyErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = useCallback(async () => {
    setResending(true);
    setErrorMessage("");

    try {
      await greenFibreAuthService.resendOtp(email);
      setOtpCode("");
      masterInputRef.current?.focus();
      dispatch(
        showToast({
          message: "A new verification code has been sent to your email.",
          type: "success",
        }),
      );
      return true;
    } catch (error) {
      const message = error?.message || "Unable to resend verification code.";
      setErrorMessage(message);
      dispatch(showToast({ message, type: "error" }));
      return false;
    } finally {
      setResending(false);
    }
  }, [email, dispatch]);

  const handleBackToRegistration = () => {
    navigation.replace("Register");
  };

  const handleBoxPress = () => {
    masterInputRef.current?.focus();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.replace("Login"))}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 24, 40) },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Hero Banner */}
            <View style={styles.hero}>
              <LinearGradient
                colors={[theme.primaryLight, "#C8E6C9"]}
                style={styles.heroIcon}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={36}
                  color={theme.primary}
                />
              </LinearGradient>
              <Text style={styles.title}>Verify Your Account</Text>
              <Text style={styles.subtitle}>
                We have sent a 6-digit verification code to
              </Text>
              <View style={styles.emailBadge}>
                <Ionicons name="mail-outline" size={15} color={theme.primary} />
                <Text style={styles.maskedEmail}>{maskEmail(email)}</Text>
              </View>
            </View>

            {/* OTP Input Card */}
            <View style={styles.card}>
              <Text style={styles.fieldLabel}>Enter Verification Code</Text>

              {/* Master Hidden Input (covers whole row so taps focus directly with zero blinking) */}
              <View style={styles.otpContainer}>
                <TextInput
                  ref={masterInputRef}
                  value={otpCode}
                  onChangeText={handleOtpChange}
                  maxLength={OTP_LENGTH}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={styles.hiddenInput}
                  caretHidden
                  autoFocus
                />

                {/* 6 Visual OTP Digits (Smooth highlight, zero jumping) */}
                <Pressable
                  onPress={handleBoxPress}
                  style={styles.otpBoxesRow}
                  accessible={false}
                >
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const char = otpCode[index] || "";
                    const isCurrent = isFocused && index === otpCode.length;
                    const isFilled = Boolean(char);

                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          isFilled && styles.otpBoxFilled,
                          isCurrent && styles.otpBoxActive,
                          errorMessage ? styles.otpBoxError : null,
                        ]}
                      >
                        <Text style={styles.otpDigit}>{char}</Text>
                        {isCurrent && <View style={styles.activeCursor} />}
                      </View>
                    );
                  })}
                </Pressable>
              </View>

              {/* Error Message */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color={theme.danger}
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Verify Button */}
              <Button
                title={submitting ? "Verifying..." : "Verify & Continue"}
                onPress={handleVerify}
                loading={submitting}
                style={styles.verifyButton}
              />

              {/* Isolated Resend Section */}
              <ResendTimerSection
                onResend={handleResend}
                resending={resending}
              />
            </View>

            {/* Back to Registration link */}
            <TouchableOpacity
              style={styles.backLink}
              onPress={handleBackToRegistration}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color={theme.primary} />
              <Text style={styles.backLinkText}>Back to Registration</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.cream,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: "DMSans_600SemiBold",
    color: theme.text,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  hero: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    color: theme.text,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "DMSans_400Regular",
    color: theme.textSecondary,
    textAlign: "center",
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(28, 74, 42, 0.12)",
  },
  maskedEmail: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: theme.primary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: theme.textSecondary,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  otpContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    zIndex: 2,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  otpBox: {
    flex: 1,
    height: 54,
    marginHorizontal: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.borderLight,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  otpBoxFilled: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryLight,
  },
  otpBoxActive: {
    borderColor: theme.primary,
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxError: {
    borderColor: theme.danger,
    backgroundColor: "#FFF5F5",
  },
  otpDigit: {
    fontSize: 22,
    fontFamily: "DMMono_500Medium",
    color: theme.text,
    fontWeight: "700",
  },
  activeCursor: {
    position: "absolute",
    bottom: 10,
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.primary,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.2)",
  },
  errorText: {
    flex: 1,
    color: theme.danger,
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
  },
  verifyButton: {
    marginTop: 4,
    borderRadius: 12,
    height: 50,
  },
  resendSection: {
    alignItems: "center",
    marginTop: 20,
    gap: 6,
  },
  resendPrompt: {
    fontSize: 13,
    fontFamily: "DMSans_400Regular",
    color: theme.textSecondary,
  },
  countdownPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  countdownText: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: theme.textMuted,
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: theme.primary,
  },
  backLink: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: "DMSans_600SemiBold",
    color: theme.primary,
  },
});
