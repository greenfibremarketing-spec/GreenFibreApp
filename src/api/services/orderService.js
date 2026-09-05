import { authApiClient } from '../authClient';
import {
    normalizeCreateOrderResponse,
    normalizeOrder,
    normalizeOrderListResponse,
} from '../../utils/orderNormalize';

function createOrderError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message
        || (status === 401 ? 'Please log in to place an order.' : null)
        || (status === 403 ? 'You are not allowed to access this order.' : null)
        || (status === 429 ? 'Too many requests. Please try again later.' : null)
        || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
        || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
        || 'Something went wrong with your order. Please try again.';

    const orderError = new Error(message);
    orderError.status = status;
    orderError.data = error.response?.data;
    return orderError;
}

async function request(config) {
    try {
        const response = await authApiClient(config);
        return response.data;
    }
    catch (error) {
        throw createOrderError(error);
    }
}

export const orderService = {
    async getMyOrders(params = {}) {
        const data = await request({
            method: 'GET',
            url: '/order/my-orders',
            params,
        });
        return normalizeOrderListResponse(data);
    },

    async getOrderById(orderId) {
        const data = await request({
            method: 'GET',
            url: `/order/${encodeURIComponent(orderId)}`,
        });
        return normalizeOrder(data?.order);
    },

    async createOrder({ shippingAddress, couponCode } = {}) {
        const payload = { shippingAddress };
        if (couponCode?.trim()) {
            payload.couponCode = couponCode.trim();
        }

        const data = await request({
            method: 'POST',
            url: '/order/create',
            data: payload,
        });

        return normalizeCreateOrderResponse(data);
    },
};
