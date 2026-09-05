// app/screens/ResetPasswordScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { greenFibreAuthService } from "../api/services/greenFibreAuthService";
// FNP Brand Colors (same as RegisterScreen)
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

export default function ResetPasswordScreen({ navigation, route }) {
  // Get email from navigation params
  const { email } = route.params || {};

  // Form state
  const [form, setForm] = useState({
    email: email || "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Refs for TextInput
  const tokenInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  // Password validation helpers
  const hasMinLength = form.newPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(form.newPassword);
  const hasLowerCase = /[a-z]/.test(form.newPassword);
  const hasNumber = /[0-9]/.test(form.newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword);
  const isPasswordValid =
    hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

  // Update form field
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate field on blur
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "email":
        if (!value || value.trim().length === 0) {
          error = "Email is required";
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = "Please enter a valid email address";
          }
        }
        break;
      case "token":
        if (!value || value.trim().length === 0) {
          error = "Reset token is required";
        } else if (!/^\d{6}$/.test(value.trim())) {
          error = "Token must be a 6-digit number";
        }
        break;
      case "newPassword":
        if (!value || value.length === 0) {
          error = "Password is required";
        } else if (!isPasswordValid) {
          error = "Password must meet all requirements";
        }
        // Also validate confirm password if it has a value
        if (form.confirmPassword && value !== form.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "Passwords do not match",
          }));
        } else if (form.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
        }
        break;
      case "confirmPassword":
        if (!value || value.length === 0) {
          error = "Please confirm your password";
        } else if (value !== form.newPassword) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  /**
   * Handle Reset Password
   * Validates inputs and calls API to reset password
   */
  const handleResetPassword = async () => {
    // Validate all fields
    const emailError = validateField("email", form.email);
    const tokenError = validateField("token", form.token);
    const passwordError = validateField("newPassword", form.newPassword);
    const confirmError = validateField("confirmPassword", form.confirmPassword);

    if (emailError || tokenError || passwordError || confirmError) {
      Alert.alert(
        "Validation Error",
        "Please fix all errors before continuing.",
        [{ text: "OK" }],
      );
      return;
    }

    setLoading(true);

    try {
      // API Call - Replace with your actual API endpoint
      const response = await greenFibreAuthService.resetPassword({
        email: form.email.trim(),
        otp: form.token.trim(),
        password: form.newPassword,
      });

      if (response.success) {
        // Success
        Alert.alert(
          "✅ Password Reset Successful",
          "Your password has been updated successfully. Please login with your new password.",
          [
            {
              text: "Go to Login",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                }),
            },
          ],
        );
      } else {
        // Error from backend
        Alert.alert(
          "Reset Failed",
          response.message || "Failed to reset password. Please try again.",
        );
      }
    } catch (error) {
      // Network or other errors
      Alert.alert(
        "Error",
        error?.response?.data?.message
          || error.message
          || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Resend Token
   * Navigate to ForgotPassword or call resend API
   */
  const handleResendToken = () => {
    // Validate email before resending
    if (!form.email || form.email.trim().length === 0) {
      Alert.alert(
        "Email Required",
        "Please enter your email address to receive a new token.",
      );
      return;
    }

    Alert.alert(
      "Resend Token",
      `A new 6-digit reset token will be sent to ${form.email}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Send",
          onPress: async () => {
            try {
              // Call forgot password API to resend token
              const response = await greenFibreAuthService.forgotPassword(
                form.email.trim(),
              );

              if (response.success) {
                Alert.alert(
                  "✅ Token Sent",
                  response.message
                    || "A new 6-digit reset token has been sent to your email.",
                  [{ text: "OK" }],
                );
              } else {
                Alert.alert(
                  "Failed",
                  response.message
                    || "Failed to send reset token. Please try again.",
                );
              }
            } catch (error) {
              Alert.alert(
                "Error",
                error?.response?.data?.message
                  || error.message
                  || "An unexpected error occurred.",
              );
            }
          },
        },
      ],
    );
  };

  // Handle next input
  const handleNext = (field) => {
    switch (field) {
      case "token":
        passwordInputRef.current?.focus();
        break;
      case "newPassword":
        confirmPasswordInputRef.current?.focus();
        break;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* ===== HERO SECTION ===== */}
          <View style={styles.hero}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={fnpColors.text} />
            </TouchableOpacity>

            <View style={styles.heroIconContainer}>
              <LinearGradient
                colors={[fnpColors.primaryLight, "#F8BBD0"]}
                style={styles.heroIconGradient}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={40}
                  color={fnpColors.primary}
                />
              </LinearGradient>
            </View>
            <Text style={styles.heroTitle}>Reset Password</Text>
            <Text style={styles.heroText}>
              We've sent a 6-digit reset token to your registered email address.
              Enter the token below and create your new password.
            </Text>
            <View style={styles.tokenInfoContainer}>
              <Ionicons
                name="time-outline"
                size={14}
                color={fnpColors.textMuted}
              />
              <Text style={styles.tokenInfoText}>
                Token expires in 10 minutes
              </Text>
            </View>
          </View>

          {/* ===== FORM SECTION ===== */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>Create New Password</Text>
            <Text style={styles.formSubtitle}>
              Enter the 6-digit reset token and your new password
            </Text>

            {/* Email Field - Read Only */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>
                Email Address <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[styles.inputContainer, styles.readOnlyInputContainer]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={fnpColors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.readOnlyInput]}
                  value={form.email}
                  editable={false}
                  placeholderTextColor={fnpColors.textMuted}
                />
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={fnpColors.success}
                  style={styles.inputIconRight}
                />
              </View>
            </View>

            {/* Reset Token Input - 6-digit numeric */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>
                Reset Token <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.token && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color={fnpColors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={tokenInputRef}
                  style={styles.input}
                  value={form.token}
                  onChangeText={(text) => {
                    // Only allow numeric input
                    const numericText = text.replace(/[^0-9]/g, "");
                    updateField("token", numericText);
                  }}
                  placeholder="Enter 6-digit token"
                  placeholderTextColor={fnpColors.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => handleNext("token")}
                  blurOnSubmit={false}
                />
                {form.token.length === 6 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={fnpColors.success}
                    style={styles.inputIconRight}
                  />
                )}
              </View>
              {errors.token && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={fnpColors.danger}
                  />
                  <Text style={styles.errorText}>{errors.token}</Text>
                </View>
              )}
              <Text style={styles.tokenHint}>
                Enter the 6-digit code from your email
              </Text>
            </View>

            {/* New Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>
                New Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.newPassword && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={fnpColors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  value={form.newPassword}
                  onChangeText={(text) => updateField("newPassword", text)}
                  placeholder="Create a strong password"
                  placeholderTextColor={fnpColors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => handleNext("newPassword")}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={fnpColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={fnpColors.danger}
                  />
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>
                Confirm Password <Text style={styles.requiredStar}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.confirmPassword && styles.inputContainerError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={fnpColors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmPasswordInputRef}
                  style={styles.input}
                  value={form.confirmPassword}
                  onChangeText={(text) => updateField("confirmPassword", text)}
                  placeholder="Confirm your new password"
                  placeholderTextColor={fnpColors.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  blurOnSubmit={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={22}
                    color={fnpColors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={14}
                    color={fnpColors.danger}
                  />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              )}
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>
                Password Requirements:
              </Text>

              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasMinLength ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={hasMinLength ? fnpColors.success : fnpColors.textMuted}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasMinLength && styles.requirementMet,
                  ]}
                >
                  Minimum 8 characters
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasUpperCase ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={hasUpperCase ? fnpColors.success : fnpColors.textMuted}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasUpperCase && styles.requirementMet,
                  ]}
                >
                  One uppercase letter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasLowerCase ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={hasLowerCase ? fnpColors.success : fnpColors.textMuted}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasLowerCase && styles.requirementMet,
                  ]}
                >
                  One lowercase letter
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasNumber ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={hasNumber ? fnpColors.success : fnpColors.textMuted}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasNumber && styles.requirementMet,
                  ]}
                >
                  One number
                </Text>
              </View>

              <View style={styles.requirementItem}>
                <Ionicons
                  name={hasSpecialChar ? "checkmark-circle" : "ellipse-outline"}
                  size={18}
                  color={
                    hasSpecialChar ? fnpColors.success : fnpColors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasSpecialChar && styles.requirementMet,
                  ]}
                >
                  One special character
                </Text>
              </View>
            </View>

            <Text style={styles.termsText}>
              Your password will be encrypted and securely stored.
            </Text>

            {/* Reset Password Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[fnpColors.primary, fnpColors.primaryDark]}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.submitBtnText}>Resetting...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>Reset Password</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Token Link */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the token?</Text>
              <TouchableOpacity onPress={handleResendToken} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend Token</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Login Link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Remember your password?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              🔐 Secure password reset for your account
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fnpColors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // ===== HERO =====
  hero: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: fnpColors.primaryLight,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconContainer: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  heroIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: fnpColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  heroText: {
    fontSize: 14,
    color: fnpColors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  tokenInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 6,
  },
  tokenInfoText: {
    fontSize: 13,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },

  // ===== FORM =====
  form: {
    padding: 16,
    backgroundColor: fnpColors.white,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: fnpColors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: fnpColors.textMuted,
    marginBottom: 20,
  },

  // ===== INPUTS =====
  inputWrapper: {
    marginBottom: 16,
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
  readOnlyInputContainer: {
    backgroundColor: "#F0F0F0",
    borderColor: fnpColors.borderLight,
  },
  inputContainerError: {
    borderColor: fnpColors.danger,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconRight: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: fnpColors.text,
    paddingVertical: 12,
    height: "100%",
  },
  readOnlyInput: {
    color: fnpColors.textSecondary,
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 4,
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
  tokenHint: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
  },

  // ===== REQUIREMENTS =====
  requirementsContainer: {
    marginTop: 4,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 13,
    color: fnpColors.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: fnpColors.textMuted,
    marginLeft: 8,
  },
  requirementMet: {
    color: fnpColors.textSecondary,
  },

  // ===== TERMS & SUBMIT =====
  termsText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    height: 56,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: fnpColors.white,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // ===== RESEND ROW =====
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  resendText: {
    fontSize: 14,
    color: fnpColors.textMuted,
  },
  resendLink: {
    fontSize: 14,
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== LOGIN ROW =====
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  loginText: {
    fontSize: 14,
    color: fnpColors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    color: fnpColors.primary,
    fontWeight: "600",
  },

  // ===== FOOTER =====
  footer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 20,
  },
});
