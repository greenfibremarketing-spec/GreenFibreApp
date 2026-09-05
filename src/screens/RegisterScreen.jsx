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
import { brand } from "../data/content";
import { colors, spacing, typography, shadows } from "../theme";
import { ScreenContainer } from "../components/common/ScreenContainer";
import { Button } from "../components/common/Button";
import { greenFibreAuthService } from "../api/services/greenFibreAuthService";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearAuthError } from "../store/slices/authSlice";
import { showToast } from "../store/slices/uiSlice";

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

const benefits = [
  "Access to 100+ sustainable products",
  "Exclusive member discounts and offers",
  "Track your environmental impact",
  "Join a community of conscious consumers",
];

export function RegisterScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector((state) => state.auth);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error states
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Refs for TextInput
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
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

  // Update form field
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    dispatch(clearAuthError());

    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate field on blur
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value || value.trim().length === 0) {
          error = "Name is required";
        } else if (value.trim().length < 2) {
          error = "Name must be at least 2 characters";
        }
        break;
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
      case "phone":
        if (value?.trim() && !/^\d{10}$/.test(value.trim())) {
          error = "Phone must be a 10-digit number";
        }
        break;
      case "password":
        if (!value || value.length === 0) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
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
        } else if (value !== form.password) {
          error = "Passwords do not match";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  // Handle register
  const handleRegister = async () => {
    // Validate all fields
    const nameError = validateField("name", form.name);
    const emailError = validateField("email", form.email);
    const phoneError = validateField("phone", form.phone);
    const passwordError = validateField("password", form.password);
    const confirmError = validateField("confirmPassword", form.confirmPassword);

    if (nameError || emailError || phoneError || passwordError || confirmError) {
      Alert.alert(
        "Validation Error",
        "Please fix all errors before continuing.",
        [{ text: "OK" }],
      );
      return;
    }

    dispatch(clearAuthError());
    setSubmitting(true);
    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      await greenFibreAuthService.register({
        full_name: form.name.trim(),
        email: normalizedEmail,
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      dispatch(
        showToast({
          message: "Account created. Please verify your email.",
          type: "success",
        }),
      );
      navigation.replace("VerifyEmail", { email: normalizedEmail });
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Registration failed. Please try again.";
      dispatch(showToast({ message, type: "error" }));
      Alert.alert("Registration Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle next input
  const handleNext = (field) => {
    switch (field) {
      case "name":
        emailInputRef.current?.focus();
        break;
      case "email":
        phoneInputRef.current?.focus();
        break;
      case "phone":
        passwordInputRef.current?.focus();
        break;
      case "password":
        confirmPasswordInputRef.current?.focus();
        break;
    }
  };

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
              <View style={styles.heroIconContainer}>
                <LinearGradient
                  colors={[fnpColors.primaryLight, "#C8E6C9"]}
                  style={styles.heroIconGradient}
                >
                  <Ionicons
                    name="leaf-outline"
                    size={40}
                    color={fnpColors.primary}
                  />
                </LinearGradient>
              </View>
              <Text style={styles.heroTitle}>Create Account</Text>
              <Text style={styles.heroText}>
                Join {brand.name} and start your journey towards sustainable
                living.
              </Text>
              <View style={styles.benefitsContainer}>
                {benefits.map((b, i) => (
                  <View key={i} style={styles.benefitRow}>
                    <View style={styles.benefitIconWrap}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={fnpColors.white}
                      />
                    </View>
                    <Text style={styles.benefitText}>{b}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ===== FORM SECTION ===== */}
            <View style={styles.form}>
              <Text style={styles.formTitle}>Get Started</Text>
              <Text style={styles.formSubtitle}>
                Fill in your details to create your account
              </Text>

              {/* Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.name && styles.inputContainerError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={fnpColors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    value={form.name}
                    onChangeText={(text) => updateField("name", text)}
                    placeholder="Enter your full name"
                    placeholderTextColor={fnpColors.textMuted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => handleNext("name")}
                    blurOnSubmit={false}
                  />
                </View>
                {errors.name && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={fnpColors.danger}
                    />
                    <Text style={styles.errorText}>{errors.name}</Text>
                  </View>
                )}
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  Email Address <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.email && styles.inputContainerError,
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
                    value={form.email}
                    onChangeText={(text) => updateField("email", text)}
                    placeholder="you@example.com"
                    placeholderTextColor={fnpColors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => handleNext("email")}
                    blurOnSubmit={false}
                  />
                </View>
                {errors.email && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={fnpColors.danger}
                    />
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </View>
                )}
              </View>

              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={fnpColors.textMuted}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={phoneInputRef}
                    style={styles.input}
                    value={form.phone}
                    onChangeText={(text) => updateField("phone", text)}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={fnpColors.textMuted}
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => handleNext("phone")}
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>
                  Password <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputContainerError,
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
                    value={form.password}
                    onChangeText={(text) => updateField("password", text)}
                    placeholder="Create a password (min 6 characters)"
                    placeholderTextColor={fnpColors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => handleNext("password")}
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
                {errors.password && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={fnpColors.danger}
                    />
                    <Text style={styles.errorText}>{errors.password}</Text>
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
                    onChangeText={(text) =>
                      updateField("confirmPassword", text)
                    }
                    placeholder="Confirm your password"
                    placeholderTextColor={fnpColors.textMuted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
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
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  </View>
                )}
              </View>

              {/* General Error */}
              {error && (
                <View style={styles.generalErrorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={16}
                    color={fnpColors.danger}
                  />
                  <Text style={styles.generalErrorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.termsText}>
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </Text>

              <Button
                title="Create Account"
                onPress={handleRegister}
                loading={submitting}
                style={styles.submitBtn}
              />

              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Login")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}>Sign In Instead</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🌱 Join the sustainable living movement
              </Text>
            </View>

            <View style={styles.bottomSpacer} />
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
    paddingBottom: 20,
  },

  // ===== HERO =====
  hero: {
    padding: 16,
    paddingTop: 24,
    backgroundColor: fnpColors.primaryLight,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  heroIconContainer: {
    alignItems: "center",
    marginBottom: 16,
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
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitIconWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: fnpColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 13,
    color: fnpColors.textSecondary,
    flex: 1,
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
  generalErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  generalErrorText: {
    fontSize: 13,
    color: fnpColors.danger,
    fontWeight: "500",
    flex: 1,
  },

  // ===== TERMS & SUBMIT =====
  termsText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  submitBtn: {
    backgroundColor: fnpColors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16,
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

// export default RegisterScreen;
