import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { Button } from '../components/common/Button';
import { greenFibreAuthService } from '../api/services/greenFibreAuthService';
import { hasAuthCookie } from '../api/cookieJar';
import { maskEmail } from '../utils/authUser';
import { useAppDispatch } from '../store/hooks';
import { completeAuthentication } from '../store/thunks/authThunks';
import { showToast } from '../store/slices/uiSlice';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

const theme = {
    primary: '#2E7D32',
    primaryDark: '#1B5E20',
    primaryLight: '#E8F5E9',
    text: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#999999',
    danger: '#F44336',
    borderLight: '#E8E8E8',
    cream: '#FFF8F0',
};

function getVerifyErrorMessage(error) {
    const code = error?.code;
    const attemptsRemaining = error?.data?.attemptsRemaining;

    switch (code) {
        case 'OTP_INVALID':
            if (typeof attemptsRemaining === 'number') {
                return attemptsRemaining > 0
                    ? `Invalid code. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining.`
                    : 'Invalid code. Please request a new verification code.';
            }
            return error.message || 'Invalid verification code.';
        case 'OTP_EXPIRED':
            return 'This verification code has expired. Please request a new code.';
        case 'OTP_MAX_ATTEMPTS':
            return 'Maximum attempts reached. Please request a new verification code.';
        case 'OTP_MISSING':
            return 'No verification code found. Please request a new code.';
        case 'ALREADY_VERIFIED':
            return 'This email is already verified. Please sign in.';
        default:
            return error?.message || 'Unable to verify your email right now.';
    }
}

export function VerifyEmailScreen({ navigation, route }) {
    const dispatch = useAppDispatch();
    const email = route.params?.email?.trim().toLowerCase() || '';

    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);

    const inputRefs = useRef([]);
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
    }, [fadeAnim, slideAnim]);

    useEffect(() => {
        if (countdown <= 0) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setCountdown((current) => current - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    useEffect(() => {
        if (!email) {
            navigation.replace('Register');
        }
    }, [email, navigation]);

    const otpValue = digits.join('');

    const focusInput = (index) => {
        inputRefs.current[index]?.focus();
    };

    const clearOtpInputs = () => {
        setDigits(Array(OTP_LENGTH).fill(''));
        setErrorMessage('');
        focusInput(0);
    };

    const handleDigitChange = (index, value) => {
        const sanitized = value.replace(/\D/g, '');

        if (!sanitized) {
            const nextDigits = [...digits];
            nextDigits[index] = '';
            setDigits(nextDigits);
            setErrorMessage('');
            return;
        }

        if (sanitized.length > 1) {
            const pastedDigits = sanitized.slice(0, OTP_LENGTH).split('');
            const nextDigits = Array(OTP_LENGTH).fill('');
            pastedDigits.forEach((digit, digitIndex) => {
                nextDigits[digitIndex] = digit;
            });
            setDigits(nextDigits);
            setErrorMessage('');
            focusInput(Math.min(pastedDigits.length, OTP_LENGTH - 1));
            return;
        }

        const nextDigits = [...digits];
        nextDigits[index] = sanitized;
        setDigits(nextDigits);
        setErrorMessage('');

        if (index < OTP_LENGTH - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyPress = (index, key) => {
        if (key !== 'Backspace') {
            return;
        }

        if (digits[index]) {
            const nextDigits = [...digits];
            nextDigits[index] = '';
            setDigits(nextDigits);
            setErrorMessage('');
            return;
        }

        if (index > 0) {
            const nextDigits = [...digits];
            nextDigits[index - 1] = '';
            setDigits(nextDigits);
            setErrorMessage('');
            focusInput(index - 1);
        }
    };

    const handleVerify = async () => {
        if (otpValue.length !== OTP_LENGTH) {
            setErrorMessage('Please enter the complete 6-digit verification code.');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        try {
            const verifyResult = await greenFibreAuthService.verifyOtp({
                email,
                otp: otpValue,
            });

            if (!verifyResult.authenticated && !hasAuthCookie()) {
                throw new Error('Verification succeeded but the session cookie was not stored.');
            }

            await dispatch(completeAuthentication()).unwrap();

            dispatch(showToast({
                message: 'Email verified successfully. Welcome to Green Fibre!',
                type: 'success',
            }));

            navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
            });
        }
        catch (error) {
            if (error?.code === 'ALREADY_VERIFIED') {
                dispatch(showToast({
                    message: 'Your email is already verified. Please sign in.',
                    type: 'success',
                }));
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
                return;
            }

            setErrorMessage(getVerifyErrorMessage(error));
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0 || resending) {
            return;
        }

        setResending(true);
        setErrorMessage('');

        try {
            await greenFibreAuthService.resendOtp(email);
            setCountdown(RESEND_COOLDOWN_SECONDS);
            clearOtpInputs();
            dispatch(showToast({
                message: 'A new verification code has been sent to your email.',
                type: 'success',
            }));
        }
        catch (error) {
            const message = error?.message || 'Unable to resend verification code.';
            setErrorMessage(message);
            dispatch(showToast({ message, type: 'error' }));
        }
        finally {
            setResending(false);
        }
    };

    const handleBackToRegistration = () => {
        navigation.replace('Register');
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                        <View style={styles.hero}>
                            <LinearGradient
                                colors={[theme.primaryLight, '#C8E6C9']}
                                style={styles.heroIcon}
                            >
                                <Ionicons name="mail-open-outline" size={34} color={theme.primary} />
                            </LinearGradient>
                            <Text style={styles.title}>Check Your Email</Text>
                            <Text style={styles.subtitle}>
                                We sent a 6-digit verification code to
                            </Text>
                            <Text style={styles.maskedEmail}>{maskEmail(email)}</Text>
                        </View>

                        <Text style={styles.fieldLabel}>Verification Code</Text>
                        <View style={styles.otpRow}>
                            {digits.map((digit, index) => (
                                <TextInput
                                    key={`otp-${index}`}
                                    ref={(ref) => {
                                        inputRefs.current[index] = ref;
                                    }}
                                    style={[
                                        styles.otpInput,
                                        digit ? styles.otpInputFilled : null,
                                        errorMessage ? styles.otpInputError : null,
                                    ]}
                                    value={digit}
                                    onChangeText={(value) => handleDigitChange(index, value)}
                                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                                    keyboardType="number-pad"
                                    maxLength={OTP_LENGTH}
                                    selectTextOnFocus
                                    textContentType="oneTimeCode"
                                    autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                                />
                            ))}
                        </View>

                        {errorMessage ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
                                <Text style={styles.errorText}>{errorMessage}</Text>
                            </View>
                        ) : null}

                        <Button
                            title="Verify Email"
                            onPress={handleVerify}
                            loading={submitting}
                            style={styles.verifyButton}
                        />

                        <View style={styles.resendSection}>
                            <Text style={styles.resendPrompt}>Didn't receive the code?</Text>
                            {countdown > 0 ? (
                                <Text style={styles.countdownText}>
                                    Resend available in {countdown}s
                                </Text>
                            ) : (
                                <TouchableOpacity
                                    onPress={handleResend}
                                    disabled={resending}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.resendLink}>
                                        {resending ? 'Sending...' : 'Resend verification code'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

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
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.cream,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    hero: {
        alignItems: 'center',
        marginBottom: 32,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.textSecondary,
        textAlign: 'center',
    },
    maskedEmail: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '600',
        color: theme.primary,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 16,
    },
    otpInput: {
        flex: 1,
        maxWidth: 48,
        height: 56,
        borderWidth: 1.5,
        borderColor: theme.borderLight,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '700',
        color: theme.text,
    },
    otpInputFilled: {
        borderColor: theme.primary,
        backgroundColor: theme.primaryLight,
    },
    otpInputError: {
        borderColor: theme.danger,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#FFEBEE',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    errorText: {
        flex: 1,
        color: theme.danger,
        fontSize: 14,
        lineHeight: 20,
    },
    verifyButton: {
        marginTop: 8,
    },
    resendSection: {
        alignItems: 'center',
        marginTop: 24,
        gap: 8,
    },
    resendPrompt: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    countdownText: {
        fontSize: 14,
        color: theme.textMuted,
        fontWeight: '500',
    },
    resendLink: {
        fontSize: 15,
        color: theme.primary,
        fontWeight: '600',
    },
    backLink: {
        marginTop: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    backLinkText: {
        fontSize: 15,
        color: theme.primary,
        fontWeight: '600',
    },
});
