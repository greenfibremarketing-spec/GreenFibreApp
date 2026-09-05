import catalogClient from '../catalogClient';
import {
    normalizeProduct,
    normalizeProductListResponse,
} from '../../utils/catalogNormalize';

export const productService = {
    async getProducts(params = {}) {
        const response = await catalogClient.get('/product/', { params });
        return normalizeProductListResponse(response.data);
    },

    async getProductsByCategory(categorySlug, params = {}) {
        if (!categorySlug || categorySlug === 'all') {
            return this.getProducts(params);
        }

        const response = await catalogClient.get('/product/', {
            params: {
                ...params,
                category: categorySlug,
            },
        });
        return normalizeProductListResponse(response.data);
    },

    async getProductById(idOrSlug) {
        const response = await catalogClient.get(`/product/${encodeURIComponent(idOrSlug)}`);
        return normalizeProduct(response.data?.product);
    },

    async searchProducts(query, params = {}) {
        const response = await catalogClient.get('/product/search', {
            params: {
                q: query,
                ...params,
            },
        });
        return normalizeProductListResponse(response.data);
    },

    async getRelatedProducts(slug, params = {}) {
        const response = await catalogClient.get(`/product/related/${encodeURIComponent(slug)}`, {
            params,
        });

        return {
            products: (response.data?.products || [])
                .map((product) => normalizeProduct(product))
                .filter(Boolean),
        };
    },
};
