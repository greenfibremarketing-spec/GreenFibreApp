// src/screens/RazorpayPaymentScreen.jsx
// Green Fibre — In-App Razorpay Payment Screen using WebView

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import { CustomAlert } from '../components/common/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAppDispatch } from '../store/hooks';
import { clearCart } from '../store/slices/cartSlice';
import { razorpayService } from '../api/services/razorpayService';
import { buildRazorpayCheckoutHtml } from '../utils/razorpayPayment';
import { colors, spacing, typography } from '../theme';

export function RazorpayPaymentScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const {
    razorpayOrderId,
    amount,
    currency = 'INR',
    keyId,
    orderId,
    customerInfo = {},
    notes = {},
  } = route.params || {};

  const [verifying, setVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('Connecting to gateway...');
  const webViewRef = useRef(null);

  const html = buildRazorpayCheckoutHtml({
    keyId,
    orderId: razorpayOrderId,
    amount,
    currency,
    customerInfo,
    notes,
    themeColor: colors.primary || '#1C4A2A',
  });

  const handleCancelPayment = () => {
    if (verifying) return;

    CustomAlert.alert(
      "Cancel Payment?",
      "If you go back now, this payment session will be cancelled and your transaction will not be completed. Are you sure you want to exit?",
      [
        {
          text: "Continue Payment",
          style: "cancel",
        },
        {
          text: "Yes, Cancel Payment",
          style: "destructive",
          onPress: () => {
            navigation.replace('OrderConfirmation', {
              orderId,
              success: false,
              message: 'Payment was cancelled. Your order has been saved in your Order History.',
            });
          },
        },
      ]
    );
  };

  useEffect(() => {
    const onBackPress = () => {
      handleCancelPayment();
      return true; // prevent automatic back navigation
    };

    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backSubscription.remove();
  }, [verifying, orderId]);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const { type, payload } = data;

      if (type === 'SUCCESS') {
        setVerifying(true);
        setVerifyStatus('Verifying payment signature with bank...');

        try {
          const verifyResult = await razorpayService.verifyPayment({
            razorpay_order_id: payload.razorpay_order_id,
            razorpay_payment_id: payload.razorpay_payment_id,
            razorpay_signature: payload.razorpay_signature,
            greenfibreOrderId: orderId,
            orderId,
          });

          // Empty local cart after verified payment
          dispatch(clearCart());

          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (_) {}

          navigation.replace('OrderConfirmation', {
            orderId: verifyResult.orderId || orderId,
            success: true,
            message: 'Your payment was successful and your sustainable order is confirmed!',
          });
        } catch (vErr) {
          setVerifying(false);
          CustomAlert.alert(
            'Verification Error',
            vErr.message || 'We received your payment but could not verify signature immediately. Check My Orders for status.',
            [
              {
                text: 'View Order Status',
                onPress: () =>
                  navigation.replace('OrderConfirmation', {
                    orderId,
                    success: false,
                    message: vErr.message,
                  }),
              },
            ]
          );
        }
      } else if (type === 'DISMISSED') {
        // User closed / cancelled the Razorpay modal
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        } catch (_) {}
        navigation.replace('OrderConfirmation', {
          orderId,
          success: false,
          message: 'Payment was cancelled. Your order has been saved in your Order History.',
        });
      } else if (type === 'FAILED') {
        const errorDesc = payload?.error?.description || 'Transaction was declined by bank or cancelled.';
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (_) {}
        navigation.replace('OrderConfirmation', {
          orderId,
          success: false,
          message: errorDesc,
        });
      } else if (type === 'ERROR') {
        navigation.replace('OrderConfirmation', {
          orderId,
          success: false,
          message: payload?.message || 'Unable to connect to payment gateway.',
        });
      }
    } catch (parseErr) {
      console.error('Error handling webview postMessage:', parseErr);
    }
  };

  if (!razorpayOrderId || !keyId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={56} color={colors.error || '#C62828'} />
          <Text style={styles.errorTitle}>Invalid Payment Parameters</Text>
          <Text style={styles.errorSubtitle}>
            Missing required gateway configuration. Please try again.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Return to Checkout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary || '#1C4A2A'} />
          <Text style={styles.headerTitle}>Razorpay Secure Checkout</Text>
        </View>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleCancelPayment}
          accessibilityLabel="Cancel payment"
        >
          <Ionicons name="close" size={22} color={colors.text || '#1A1A1A'} />
        </TouchableOpacity>
      </View>

      {/* WebView Checkout */}
      <View style={styles.webContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['https://*', 'about:blank']}
          source={{ html, baseUrl: 'https://greenfibre.org' }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary || '#1C4A2A'} />
              <Text style={styles.loadingText}>Opening secure payment gateway...</Text>
            </View>
          )}
          style={styles.webView}
        />
      </View>

      {/* Verification Overlay */}
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <View style={styles.verifyingCard}>
            <ActivityIndicator size="large" color={colors.primary || '#1C4A2A'} />
            <Text style={styles.verifyingTitle}>Verifying Payment</Text>
            <Text style={styles.verifyingText}>{verifyStatus}</Text>
            <Text style={styles.verifyingNote}>Please do not close the app or press back.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream || '#FAF7F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: colors.cream || '#FAF7F2',
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#EFEFEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: colors.text || '#1A1A1A',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.creamDark || '#EDE8DF',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cream || '#FAF7F2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: colors.textSecondary || '#666666',
  },
  verifyingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    zIndex: 999,
  },
  verifyingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  verifyingTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: colors.primary || '#1C4A2A',
    marginTop: 8,
  },
  verifyingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.textSecondary || '#666666',
    textAlign: 'center',
  },
  verifyingNote: {
    fontFamily: 'DMMono_500Medium',
    fontSize: 11,
    color: colors.textLight || '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: colors.text || '#1A1A1A',
  },
  errorSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.textSecondary || '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary || '#1C4A2A',
  },
  backBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
