// src/api/services/razorpayService.js
// Green Fibre — Razorpay Payment Gateway Service

import { authApiClient } from '../authClient';
import { normalizeOrder } from '../../utils/orderNormalize';

function createRazorpayError(error) {
  const status = error.response?.status;
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    (status === 401 ? 'Authentication failed. Please verify credentials or log in again.' : null) ||
    (status === 400 ? 'Payment request was invalid. Please check details.' : null) ||
    (status === 429 ? 'Too many payment requests. Please wait a moment.' : null) ||
    (error.code === 'ECONNABORTED' ? 'Payment request timed out. Please check your connection.' : null) ||
    (error.message === 'Network Error' ? 'Unable to reach payment server. Check connection.' : null) ||
    'Payment processing failed. Please try again.';

  const err = new Error(message);
  err.status = status;
  err.data = error.response?.data;
  return err;
}

export const razorpayService = {
  /**
   * STEP 1: Create a Razorpay order on backend
   * Endpoint: POST /api/create-order (or /api/razorpay/create-order)
   */
  async createOrder({
    amount,
    currency = 'INR',
    receipt,
    shippingAddress,
    couponCode,
    orderId,
    notes = {},
  } = {}) {
    try {
      const payload = {
        amount: Math.round(Number(amount)), // in paise (e.g. ₹500 = 50000 paise)
        currency: String(currency).toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        notes,
      };

      if (shippingAddress) {
        payload.shippingAddress = shippingAddress;
      }
      if (couponCode?.trim()) {
        payload.couponCode = couponCode.trim();
      }
      if (orderId) {
        payload.orderId = orderId;
      }

      let response;
      try {
        response = await authApiClient.post('/create-order', payload);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await authApiClient.post('/razorpay/create-order', payload);
        } else {
          throw err;
        }
      }

      const data = response.data;
      if (!data.success && !data.order_id) {
        throw new Error(data.message || 'Failed to create Razorpay order');
      }

      return {
        success: true,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency || 'INR',
        receipt: data.receipt,
        key_id: data.key_id || '',
        orderId: data.orderId || orderId || null,
      };
    } catch (error) {
      throw createRazorpayError(error);
    }
  },

  /**
   * STEP 2: Verify HMAC-SHA256 signature on backend
   * Endpoint: POST /api/verify-payment (or /api/razorpay/verify-payment)
   */
  async verifyPayment({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    greenfibreOrderId,
    orderId,
  } = {}) {
    try {
      const payload = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        greenfibreOrderId: greenfibreOrderId || orderId,
        orderId: orderId || greenfibreOrderId,
      };

      let response;
      try {
        response = await authApiClient.post('/verify-payment', payload);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await authApiClient.post('/razorpay/verify-payment', payload);
        } else {
          throw err;
        }
      }

      const data = response.data;
      return {
        success: Boolean(data?.success),
        message: data?.message || '',
        order_id: data?.order_id || razorpay_order_id,
        payment_id: data?.payment_id || razorpay_payment_id,
        orderId: data?.orderId || greenfibreOrderId || orderId || null,
        order: data?.order ? normalizeOrder(data.order) : null,
      };
    } catch (error) {
      throw createRazorpayError(error);
    }
  },
};
