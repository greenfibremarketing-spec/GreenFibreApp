import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { useAppDispatch } from '../store/hooks';
import { verifyOrderPayment } from '../store/thunks/orderThunks';
import { fetchCart } from '../store/thunks/cartThunks';
import { fetchOrderById } from '../store/thunks/orderThunks';
import { showToast } from '../store/slices/uiSlice';
import {
  buildEasebuzzFormHtml,
  isEasebuzzCallbackUrl,
  parseEasebuzzCallbackUrl,
} from '../utils/easebuzzPayment';

export function EasebuzzPaymentScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const { paymentData, easebuzzUrl, orderId } = route.params || {};
  const [verifying, setVerifying] = useState(false);
  const handledRef = useRef(false);

  const html = buildEasebuzzFormHtml(paymentData, easebuzzUrl);

  const handleVerification = useCallback(async (payload) => {
    if (handledRef.current || !payload?.txnid) {
      return;
    }

    handledRef.current = true;
    setVerifying(true);

    try {
      const result = await dispatch(verifyOrderPayment(payload)).unwrap();

      if (result.success) {
        await dispatch(fetchCart());
        if (result.orderId || orderId) {
          await dispatch(fetchOrderById(result.orderId || orderId));
        }

        navigation.replace('OrderConfirmation', {
          orderId: result.orderId || orderId,
          success: true,
        });
        return;
      }

      navigation.replace('OrderConfirmation', {
        orderId: result.orderId || orderId,
        success: false,
        message: result.message || 'Payment was not completed.',
      });
    }
    catch (error) {
      dispatch(
        showToast({
          message: error || 'Payment verification failed.',
          type: 'error',
        }),
      );
      navigation.replace('OrderConfirmation', {
        orderId,
        success: false,
        message: error || 'Payment verification failed.',
      });
    }
    finally {
      setVerifying(false);
    }
  }, [dispatch, navigation, orderId]);

  const handleNavigation = useCallback((url) => {
    if (!isEasebuzzCallbackUrl(url)) {
      return;
    }

    const params = parseEasebuzzCallbackUrl(url);
    if (!params) {
      return;
    }

    if (!params?.txnid) {
      return;
    }

    handleVerification(params);
  }, [handleVerification]);

  if (!paymentData || !easebuzzUrl) {
    return (
      <ScreenContainer headerTitle="Payment" onMenuPress={() => navigation.goBack()}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Payment details are missing.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      headerTitle="Secure Payment"
      onMenuPress={() => navigation.goBack()}
      scroll={false}
    >
      {verifying ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.verifyingText}>Verifying payment...</Text>
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html, baseUrl: easebuzzUrl }}
          onNavigationStateChange={(event) => handleNavigation(event.url)}
          onShouldStartLoadWithRequest={(request) => {
            handleNavigation(request.url);
            return !isEasebuzzCallbackUrl(request.url);
          }}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.verifyingText}>Loading payment gateway...</Text>
            </View>
          )}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  verifyingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
