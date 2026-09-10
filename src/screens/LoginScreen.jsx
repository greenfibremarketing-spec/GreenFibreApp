import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearAuthError,
  loginStart,
  loginFailure,
} from "../store/slices/authSlice";
import { showToast } from "../store/slices/uiSlice";
import { greenFibreAuthService } from "../api/services/greenFibreAuthService";
import { completeAuthentication } from "../store/thunks/authThunks";
import { syncSessionAfterAuth } from "../store/thunks/sessionSyncThunks";
import { hasAuthCookie } from "../api/cookieJar";
import { brand } from "../data/content";

const fnpColors = {
  primary: "#2E7D32",
  primaryLight: "#E8F5E9",
  primaryDark: "#1B5E20",
  white: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#666666",
  textMuted: "#999999",
  borderLight: "#E8E8E8",
  cream: "#FFF8F0",
  danger: "#F44336",
};

export function LoginScreen({ navigation }) {
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Refs for TextInput
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

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

  // Validate password
  const validatePassword = (text) => {
    if (text && text.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    setPasswordError("");
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

  // Handle password change
  const handlePasswordChange = (text) => {
    setPassword(text);
    dispatch(clearAuthError());
    if (text) {
      validatePassword(text);
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      Alert.alert("Missing Details", "Please enter your email address.", [
        { text: "OK" },
      ]);
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.", [
        { text: "OK" },
      ]);
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      Alert.alert("Missing Details", "Please enter your password.", [
        { text: "OK" },
      ]);
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 6 characters.",
        [{ text: "OK" }],
      );
      return;
    }

    dispatch(clearAuthError());
    dispatch(loginStart());

    try {
      const loginResult = await greenFibreAuthService.login({ email: email.trim(), password });
      await dispatch(completeAuthentication(loginResult?.user || loginResult?.data?.user)).unwrap();
      dispatch(syncSessionAfterAuth());
      dispatch(
        showToast({
          message: "Welcome back! Signed in successfully.",
          type: "success",
        }),
      );
      navigation.reset({
        index: 0,
        routes: [{ name: "Main" }],
      });
    } catch (e) {
      if (e?.code === "EMAIL_NOT_VERIFIED") {
        const verifyEmail = e?.data?.email || email.trim().toLowerCase();
        dispatch(
          showToast({
            message: "Please verify your email before signing in.",
            type: "error",
          }),
        );
        navigation.navigate("VerifyEmail", { email: verifyEmail });
        return;
      }

      const message =
        e instanceof Error ? e.message : "Login failed. Please try again.";
      dispatch(loginFailure(message));
      dispatch(showToast({ message, type: "error" }));
      Alert.alert("Sign In Failed", message);
    }
  };

  // Handle next input
  const handleNext = () => {
    passwordInputRef.current?.focus();
  };

  return (
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
          {/* Header */}
          <LinearGradient
            colors={[fnpColors.primary, fnpColors.primaryDark]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue your sustainable journey with {brand.name}.
            </Text>
          </LinearGradient>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Sign In</Text>
              <Text style={styles.formSubtitle}>
                Enter your credentials to access your account
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputContainer,
                    emailError && styles.inputContainerError,
                  ]}
                >
                  <Ionicons name="mail-outline" size={20} color="#999" />
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={handleEmailChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={handleNext}
                    blurOnSubmit={false}
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
                {authError && !emailError && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={fnpColors.danger}
                    />
                    <Text style={styles.errorText}>{authError}</Text>
                  </View>
                )}
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    passwordError && styles.inputContainerError,
                  ]}
                >
                  <Ionicons name="lock-closed-outline" size={20} color="#999" />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
                {passwordError && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={14}
                      color={fnpColors.danger}
                    />
                    <Text style={styles.errorText}>{passwordError}</Text>
                  </View>
                )}
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={fnpColors.white}
                      />
                    )}
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={[fnpColors.primary, fnpColors.primaryDark]}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>New to {brand.name}?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Register")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.registerLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </View>
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
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
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
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: fnpColors.text,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  inputContainerError: {
    borderColor: fnpColors.danger,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: fnpColors.text,
    paddingVertical: 12,
  },
  eyeIcon: {
    padding: 4,
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
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: fnpColors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: fnpColors.white,
  },
  checkboxChecked: {
    backgroundColor: fnpColors.primary,
    borderColor: fnpColors.primary,
  },
  rememberMeText: {
    fontSize: 13,
    color: fnpColors.text,
    fontWeight: "500",
  },
  forgotLink: {
    fontSize: 13,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  socialSection: {
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: fnpColors.borderLight,
  },
  dividerText: {
    fontSize: 12,
    color: fnpColors.textMuted,
    paddingHorizontal: 16,
    fontWeight: "500",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 16,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fnpColors.borderLight,
    backgroundColor: fnpColors.white,
  },
  socialBtnGoogle: {
    borderColor: "#EA4335",
  },
  socialBtnApple: {
    borderColor: "#000",
  },
  socialBtnText: {
    fontSize: 14,
    color: fnpColors.text,
    fontWeight: "600",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  registerText: {
    fontSize: 14,
    color: fnpColors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    color: fnpColors.primary,
    fontWeight: "600",
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: fnpColors.textMuted,
    textAlign: "center",
  },
});
