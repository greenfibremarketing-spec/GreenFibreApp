import { authApiClient } from '../authClient';
import { normalizeCartResponse } from '../../utils/cartNormalize';

function createCartError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message
        || (status === 401 ? 'Please log in to manage your cart.' : null)
        || (status === 429 ? 'Too many requests. Please try again later.' : null)
        || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
        || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
        || 'Something went wrong with your cart. Please try again.';

    const cartError = new Error(message);
    cartError.status = status;
    cartError.data = error.response?.data;
    return cartError;
}

async function request(config) {
    try {
        const response = await authApiClient(config);
        return response.data;
    }
    catch (error) {
        throw createCartError(error);
    }
}

export const cartService = {
    async getCart() {
        const data = await request({ method: 'GET', url: '/cart/' });
        return normalizeCartResponse(data);
    },

    async addToCart(productId, colorIndex, quantity) {
        await request({
            method: 'POST',
            url: '/cart/add',
            data: { productId, colorIndex, quantity },
        });
        return this.getCart();
    },

    async updateCartItem(productId, colorIndex, quantity) {
        await request({
            method: 'PATCH',
            url: '/cart/update',
            data: { productId, colorIndex, quantity },
        });
        return this.getCart();
    },

    async removeCartItem(productId, colorIndex) {
        await request({
            method: 'DELETE',
            url: `/cart/remove/${encodeURIComponent(productId)}`,
            params: { colorIndex },
        });
        return this.getCart();
    },

    async clearCart() {
        await request({ method: 'DELETE', url: '/cart/clear' });
        return { items: [], totalAmount: 0 };
    },

    async mergeCart(items = []) {
        await request({
            method: 'POST',
            url: '/cart/merge',
            data: { items },
        });
        return this.getCart();
    },
};
