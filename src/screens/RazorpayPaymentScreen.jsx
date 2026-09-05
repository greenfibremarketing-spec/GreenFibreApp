import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { useAppDispatch } from '../store/hooks';
import { verifyOrderPayment, fetchOrderById } from '../store/thunks/orderThunks';
import { fetchCart } from '../store/thunks/cartThunks';
import { showToast } from '../store/slices/uiSlice';
import { colors, spacing, typography } from '../theme';

export function RazorpayPaymentScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const {
    orderId,
    razorpayOrderId,
    amount, // in paise
    currency = 'INR',
    keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TXVnl7XtdLZsws',
    customerName = '',
    customerEmail = '',
    customerPhone = '',
  } = route.params || {};

  const [verifying, setVerifying] = useState(false);
  const [loadingGateway, setLoadingGateway] = useState(true);
  const handledRef = useRef(false);

  const displayRupees = amount ? (amount / 100).toFixed(2) : '0.00';

  const handleVerification = useCallback(
    async (paymentDetails) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setVerifying(true);

      try {
        const payload = {
          razorpay_order_id: paymentDetails.razorpay_order_id,
          razorpay_payment_id: paymentDetails.razorpay_payment_id,
          razorpay_signature: paymentDetails.razorpay_signature,
          orderId: orderId || paymentDetails.orderId,
        };

        const result = await dispatch(verifyOrderPayment(payload)).unwrap();

        if (result.success) {
          await dispatch(fetchCart());
          const targetOrderId = result.orderId || orderId;
          if (targetOrderId) {
            await dispatch(fetchOrderById(targetOrderId));
          }

          dispatch(
            showToast({
              message: 'Payment verified! Order placed successfully.',
              type: 'success',
            }),
          );

          navigation.replace('OrderConfirmation', {
            orderId: targetOrderId,
            success: true,
          });
          return;
        }

        navigation.replace('OrderConfirmation', {
          orderId,
          success: false,
          message: result.message || 'Payment verification could not be confirmed.',
        });
      } catch (error) {
        const message = typeof error === 'string' ? error : error?.message || 'Payment verification failed.';
        dispatch(showToast({ message, type: 'error' }));
        navigation.replace('OrderConfirmation', {
          orderId,
          success: false,
          message,
        });
      } finally {
        setVerifying(false);
      }
    },
    [dispatch, navigation, orderId],
  );

  const handleMessage = useCallback(
    (event) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'PAYMENT_SUCCESS') {
          handleVerification(data.data);
        } else if (data.type === 'PAYMENT_CANCELLED') {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. Would you like to retry or return to checkout?',
            [
              { text: 'Return to Checkout', onPress: () => navigation.goBack() },
              { text: 'Retry', style: 'cancel' },
            ],
          );
        } else if (data.type === 'PAYMENT_FAILED') {
          const reason = data.error?.description || 'Transaction could not be completed.';
          Alert.alert('Payment Failed', reason, [
            { text: 'Return to Checkout', onPress: () => navigation.goBack() },
            { text: 'Try Again', style: 'cancel' },
          ]);
        }
      } catch (e) {
        console.warn('Unhandled message from Razorpay WebView:', e);
      }
    },
    [handleVerification, navigation],
  );

  // HTML content rendering official Razorpay checkout
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>GreenFibre Checkout</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      color: #0f172a;
    }
    .card {
      background: #ffffff;
      border-radius: 20px;
      padding: 28px 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      width: 100%;
      max-width: 420px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #ecfdf5;
      color: #059669;
      font-weight: 600;
      font-size: 13px;
      border-radius: 999px;
      margin-bottom: 16px;
    }
    .amount {
      font-size: 32px;
      font-weight: 800;
      color: #059669;
      margin: 8px 0 16px;
    }
    .info {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .btn {
      width: 100%;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
    }
    .btn:active {
      transform: scale(0.98);
      background: #15803d;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🔒 Razorpay Secure Payment</div>
    <h2>Green Fibre Checkout</h2>
    <div class="amount">₹${displayRupees}</div>
    <p class="info">Opening payment gateway. Pay via UPI, Cards, NetBanking or Wallets.</p>
    <button id="pay-btn" class="btn" onclick="openRazorpay()">
      Pay ₹${displayRupees}
    </button>
  </div>

  <script>
    function notify(type, data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data, error: data }));
      }
    }

    var options = {
      key: "${keyId}",
      amount: ${amount || 100},
      currency: "${currency}",
      name: "Green Fibre",
      description: "Eco-Friendly Bio-Composite Products",
      order_id: "${razorpayOrderId || ''}",
      prefill: {
        name: "${customerName || ''}",
        email: "${customerEmail || ''}",
        contact: "${customerPhone || ''}"
      },
      theme: {
        color: "#16a34a"
      },
      modal: {
        confirm_close: true,
        ondismiss: function() {
          notify('PAYMENT_CANCELLED');
        }
      },
      handler: function(response) {
        notify('PAYMENT_SUCCESS', response);
      }
    };

    function openRazorpay() {
      try {
        if (!window.Razorpay) {
          alert('Razorpay SDK is still loading. Please check your connection.');
          return;
        }
        var rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(resp) {
          notify('PAYMENT_FAILED', resp.error);
        });
        rzp.open();
      } catch (err) {
        alert('Could not open payment modal: ' + err.message);
      }
    }

    // Auto launch checkout once DOM and SDK are loaded
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        openRazorpay();
      }, 400);
    });
  </script>
</body>
</html>
  `;

  if (!razorpayOrderId) {
    return (
      <ScreenContainer headerTitle="Payment" onMenuPress={() => navigation.goBack()}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Payment details are missing or order was not created.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Return to Checkout</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerTitle="Razorpay Payment"
      onMenuPress={() => navigation.goBack()}
      scroll={false}
    >
      {verifying ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.verifyingText}>Verifying Razorpay payment...</Text>
          <Text style={styles.subVerifyingText}>Please wait while your order is being confirmed.</Text>
        </View>
      ) : (
        <View style={styles.container}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent, baseUrl: 'https://greenfibre.org' }}
            onMessage={handleMessage}
            onLoadEnd={() => setLoadingGateway(false)}
            onShouldStartLoadWithRequest={(request) => {
              // Intercept UPI apps or external intent URLs
              if (
                request.url.startsWith('upi://') ||
                request.url.startsWith('intent://') ||
                request.url.startsWith('gpay://') ||
                request.url.startsWith('phonepe://') ||
                request.url.startsWith('paytmmp://')
              ) {
                Linking.openURL(request.url).catch((err) => {
                  console.warn('Could not open UPI app:', err);
                });
                return false;
              }
              return true;
            }}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            style={styles.webview}
          />
          {loadingGateway && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading Razorpay Gateway...</Text>
            </View>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  verifyingText: {
    marginTop: spacing.lg,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subVerifyingText: {
    marginTop: spacing.xs,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
