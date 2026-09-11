import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '../components/common/ScreenContainer';
import { Button } from '../components/common/Button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchOrderById, fetchOrders } from '../store/thunks/orderThunks';
import { selectCurrentOrder } from '../store/slices/ordersSlice';
import { formatPrice } from '../utils/helpers';

export function OrderConfirmationScreen({ navigation, route }) {
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectCurrentOrder);
  const { orderId, success = true, message } = route.params || {};

  useEffect(() => {
    if (orderId && (!order || order._id !== orderId)) {
      dispatch(fetchOrderById(orderId));
    }
    // Refresh user order history
    dispatch(fetchOrders());
  }, [dispatch, orderId, order]);

  const isSuccess = Boolean(success);
  const displayOrder = order?._id === orderId ? order : null;

  return (
    <ScreenContainer headerTitle="Order Status" onMenuPress={() => navigation.navigate('Main')}>
      <View style={styles.container}>
        <LinearGradient
          colors={isSuccess ? ['#E8F5E9', '#C8E6C9'] : ['#FFEBEE', '#FFCDD2']}
          style={styles.iconWrap}
        >
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={72}
            color={isSuccess ? '#2E7D32' : '#C62828'}
          />
        </LinearGradient>

        <Text style={styles.title}>
          {isSuccess ? 'Payment Successful' : 'Payment Failed'}
        </Text>

        <Text style={styles.subtitle}>
          {message
            || (isSuccess
              ? 'Your payment was verified and your order is being processed.'
              : 'Your payment was cancelled or declined. Your order has been saved in your Order History.')}
        </Text>

        {displayOrder ? (
          <View style={styles.detailsCard}>
            <Text style={styles.detailLabel}>Order Number</Text>
            <Text style={styles.detailValue}>
              {displayOrder.razorpayOrderId || displayOrder.orderNumber || displayOrder._id}
            </Text>
            <Text style={styles.detailLabel}>
              {isSuccess ? 'Amount Paid' : 'Order Total'}
            </Text>
            <Text style={styles.detailValue}>
              {formatPrice(displayOrder.finalAmount || displayOrder.totalAmount || 0)}
            </Text>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <Text
              style={[
                styles.detailValue,
                !isSuccess && { color: '#C62828' },
              ]}
            >
              {isSuccess ? (displayOrder.orderStatus || 'Confirmed') : 'Pending / Failed'}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <Button
            title={isSuccess ? 'Track Order' : 'View in My Orders'}
            onPress={() => {
              if (isSuccess && orderId) {
                navigation.navigate('TrackOrder', { orderId });
              } else {
                navigation.navigate('Main', {
                  screen: 'Tabs',
                  params: {
                    screen: 'Orders',
                  },
                });
              }
            }}
            style={styles.actionBtn}
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Main', {
                screen: 'Tabs',
                params: {
                  screen: 'Shop',
                },
              })
            }
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>
              {isSuccess ? 'Continue Shopping' : 'Return to Shop'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  actionBtn: {
    width: '100%',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryBtnText: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 15,
  },
});
