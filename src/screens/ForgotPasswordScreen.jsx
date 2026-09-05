import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedComponent, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { greenFibreAuthService } from "../api/services/greenFibreAuthService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearAuthError } from "../store/slices/authSlice";
import { showToast } from "../store/slices/uiSlice";

const { width, height } = Dimensions.get("window");

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
};

export function ForgotPasswordScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [emailError, setEmailError] = useState("");

  // NEW: Add a ref to track if API call is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for TextInput
  const emailInputRef = useRef(null);

  // Animation values
  const iconScale = useSharedValue(1);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    iconScale.value = withSpring(1.1, { damping: 10 });
    setTimeout(() => {
      iconScale.value = withSpring(1, { damping: 10 });
    }, 300);
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  // Timer for resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Validate email
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Handle email change
  const handleEmailChange = (text) => {
    setEmail(text);
    dispatch(clearAuthError());
    if (text) {
      validateEmail(text);
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async () => {
    // NEW: Prevent multiple submissions
    if (isSubmitting || loading) {
      return;
    }

    if (!email.trim()) {
      setEmailError("Email is required");
      Alert.alert(
        "Missing Email",
        "Please enter the email address tied to your account.",
        [{ text: "OK" }],
      );
      return;
    }

    // Email validation
    if (!validateEmail(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.", [
        { text: "OK" },
      ]);
      return;
    }

    dispatch(clearAuthError());

    // NEW: Set submitting state to true
    setIsSubmitting(true);

    try {
      await greenFibreAuthService.forgotPassword(email.trim());
      dispatch(
        showToast({
          message: "📧 Reset link sent successfully!",
          type: "success",
        }),
      );
      setSent(true);
      setResendCount((prev) => prev + 1);
      setTimer(60);
      navigation.navigate("RestPassword", {
        email: email,
      });
    } catch (e) {
      const message =
        e?.response?.data?.message
        || (e instanceof Error ? e.message : null)
        || "Failed to send reset link. Please try again.";
      dispatch(showToast({ message, type: "error" }));
      Alert.alert("Error", message);
    } finally {
      // NEW: Reset submitting state regardless of success or failure
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    // NEW: Prevent resend if timer is active or submission is in progress
    if (timer > 0) {
      Alert.alert(
        "Please Wait",
        `Please wait ${timer} seconds before requesting a new link.`,
        [{ text: "OK" }],
      );
      return;
    }

    if (isSubmitting || loading) {
      Alert.alert(
        "Processing",
        "Your request is being processed. Please wait...",
        [{ text: "OK" }],
      );
      return;
    }

    handleSubmit();
  };

  const handleBackToLogin = () => {
    navigation.navigate("Login");
  };

  // Render success state
  const renderSuccess = () => (
    <AnimatedComponent.View
      entering={FadeInUp.duration(600)}
      style={styles.successContainer}
    >
      <AnimatedComponent.View
        style={[styles.successIconContainer, animatedIconStyle]}
      >
        <LinearGradient
          colors={["#E8F5E9", "#C8E6C9"]}
          style={styles.successIconGradient}
        >
          <Ionicons name="checkmark-circle" size={64} color="#2E7D32" />
        </LinearGradient>
      </AnimatedComponent.View>

      <Text style={styles.successTitle}>Check Your Email 📧</Text>
      <Text style={styles.successSubtitle}>
        We've sent a password reset link to
      </Text>
      <Text style={styles.successEmail}>{email}</Text>
      <Text style={styles.successMessage}>
        Please check your inbox and follow the instructions to reset your
        password. The link will expire in 24 hours.
      </Text>

      <View style={styles.successActions}>
        {timer > 0 ? (
          <View style={styles.resendTimerContainer}>
            <Ionicons
              name="time-outline"
              size={18}
              color={fnpColors.textMuted}
            />
            <Text style={styles.resendTimerText}>
              Resend available in {timer}s
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.resendBtn,
              (isSubmitting || loading) && styles.resendBtnDisabled,
            ]}
            onPress={handleResend}
            activeOpacity={0.7}
            disabled={isSubmitting || loading}
          >
            <Text style={styles.resendBtnText}>
              {isSubmitting || loading
                ? "Sending..."
                : "Didn't receive the email? Resend"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        title="Back to Sign In"
        onPress={handleBackToLogin}
        style={styles.backBtn}
        disabled={isSubmitting || loading}
      />

      <TouchableOpacity
        style={styles.helpLink}
        onPress={() =>
          Alert.alert("Need Help?", "Contact our support team for assistance.")
        }
        activeOpacity={0.7}
        disabled={isSubmitting || loading}
      >
        <Text style={styles.helpLinkText}>Need help? Contact Support</Text>
      </TouchableOpacity>
    </AnimatedComponent.View>
  );

  // Render form state
  const renderForm = () => (
    <AnimatedComponent.View
      entering={FadeInDown.delay(100).duration(500)}
      style={styles.formContainer}
    >
      <View style={styles.iconWrapper}>
        <LinearGradient
          colors={["#E8F5E9", "#C8E6C9"]}
          style={styles.iconGradient}
        >
          <Ionicons
            name="lock-closed-outline"
            size={40}
            color={fnpColors.primary}
          />
        </LinearGradient>
      </View>

      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        Don't worry! Enter your email address and we'll send you a link to reset
        your password.
      </Text>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>
          Email Address <Text style={styles.requiredStar}>*</Text>
        </Text>
        <View
          style={[
            styles.inputContainer,
            emailError && styles.inputContainerError,
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={fnpColors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            ref={emailInputRef}
            style={styles.input}
            value={email}
            onChangeText={handleEmailChange}
            placeholder="you@example.com"
            placeholderTextColor={fnpColors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
            editable={!isSubmitting && !loading}
          />
        </View>
        {emailError && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={fnpColors.danger}
            />
            <Text style={styles.errorText}>{emailError}</Text>
          </View>
        )}
        {error && !emailError && (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={14}
              color={fnpColors.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <Button
        title={isSubmitting || loading ? "Sending..." : "Send Reset Link"}
        onPress={handleSubmit}
        loading={isSubmitting || loading}
        style={styles.submitBtn}
        disabled={isSubmitting || loading}
      />

      <View style={styles.footerLinks}>
        <TouchableOpacity
          onPress={handleBackToLogin}
          style={styles.footerLink}
          activeOpacity={0.7}
          disabled={isSubmitting || loading}
        >
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color={fnpColors.primary}
          />
          <Text style={styles.footerLinkText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    </AnimatedComponent.View>
  );

  return (
    <ScreenContainer
      showOfferBar={false}
      headerTitle=""
      scroll={false}
      onMenuPress={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {sent ? renderSuccess() : renderForm()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fnpColors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen || 16,
  },

  // ===== FORM =====
  formContainer: {
    backgroundColor: fnpColors.white,
    borderRadius: 24,
    padding: spacing.xl || 24,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: spacing.lg || 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: fnpColors.text,
    textAlign: "center",
    marginBottom: spacing.sm || 8,
  },
  subtitle: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xl || 20,
    lineHeight: 22,
  },
  inputWrapper: {
    marginBottom: spacing.lg || 16,
  },
  inputLabel: {
    fontSize: 13,
    color: fnpColors.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  requiredStar: {
    color: fnpColors.danger,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    paddingHorizontal: 14,
    height: 52,
  },
  inputContainerError: {
    borderColor: fnpColors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: fnpColors.text,
    paddingVertical: 12,
    height: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: fnpColors.danger,
    fontWeight: "500",
  },
  submitBtn: {
    backgroundColor: fnpColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
  },
  footerLinks: {
    marginTop: spacing.lg || 16,
    alignItems: "center",
  },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs || 4,
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 14,
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== SUCCESS =====
  successContainer: {
    backgroundColor: fnpColors.white,
    borderRadius: 24,
    padding: spacing.xl || 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  successIconContainer: {
    marginBottom: spacing.lg || 16,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: fnpColors.text,
    textAlign: "center",
    marginBottom: spacing.xs || 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs || 4,
  },
  successEmail: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.primary,
    textAlign: "center",
    marginVertical: spacing.sm || 8,
  },
  successMessage: {
    fontSize: 12,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg || 16,
  },
  successActions: {
    width: "100%",
    marginBottom: spacing.md || 12,
  },
  resendTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs || 4,
    paddingVertical: 8,
  },
  resendTimerText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendBtnDisabled: {
    opacity: 0.5,
  },
  resendBtnText: {
    fontSize: 12,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  backBtn: {
    backgroundColor: fnpColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
  },
  helpLink: {
    marginTop: spacing.md || 12,
    paddingVertical: 8,
  },
  helpLinkText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
});
