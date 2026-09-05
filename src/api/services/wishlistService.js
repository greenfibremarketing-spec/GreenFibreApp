import { authApiClient } from '../authClient';
import { normalizeProduct } from '../../utils/catalogNormalize';

function createWishlistError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message
        || (status === 401 ? 'Please log in to manage your wishlist.' : null)
        || (status === 429 ? 'Too many requests. Please try again later.' : null)
        || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
        || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
        || 'Something went wrong with your wishlist. Please try again.';

    const wishlistError = new Error(message);
    wishlistError.status = status;
    wishlistError.data = error.response?.data;
    return wishlistError;
}

async function request(config) {
    try {
        const response = await authApiClient(config);
        return response.data;
    }
    catch (error) {
        throw createWishlistError(error);
    }
}

export const wishlistService = {
    async getWishlist() {
        const data = await request({ method: 'GET', url: '/wishlist/' });
        const products = (data?.products || [])
            .map((product) => normalizeProduct(product))
            .filter(Boolean);

        return {
            products,
            productIds: products.map((product) => String(product._id || product.id)),
        };
    },

    async toggleWishlist(productId) {
        const data = await request({
            method: 'POST',
            url: '/wishlist/toggle',
            data: { productId },
        });

        return {
            isWishlisted: Boolean(data?.isWishlisted),
            message: data?.message || '',
        };
    },

    async removeFromWishlist(productId) {
        await request({
            method: 'DELETE',
            url: `/wishlist/remove/${encodeURIComponent(productId)}`,
        });
        return this.getWishlist();
    },
};
