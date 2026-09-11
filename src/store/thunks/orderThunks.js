import { createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../api/services/orderService';
import { razorpayService } from '../../api/services/razorpayService';

export const fetchMyOrders = createAsyncThunk(
    'orders/fetchMyOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            return await orderService.getMyOrders(params);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load orders');
        }
    },
);

export const fetchOrderById = createAsyncThunk(
    'orders/fetchOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            return await orderService.getOrderById(orderId);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Order not found');
        }
    },
);

export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async ({ shippingAddress, couponCode }, { rejectWithValue }) => {
        try {
            return await orderService.createOrder({ shippingAddress, couponCode });
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to create order');
        }
    },
);

export const verifyOrderPayment = createAsyncThunk(
    'orders/verifyPayment',
    async (payload, { rejectWithValue }) => {
        try {
            return await razorpayService.verifyPayment(payload);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Payment verification failed');
        }
    },
);

// Backward-compatible alias for existing screens.
export const fetchOrders = fetchMyOrders;
