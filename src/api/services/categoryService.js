import catalogClient from '../catalogClient';
import { normalizeCategory } from '../../utils/catalogNormalize';

export const categoryService = {
    async getCategories() {
        const response = await catalogClient.get('/categories/');
        return (response.data?.categories || [])
            .map((category) => normalizeCategory(category))
            .filter(Boolean);
    },

    async getCategoryBySlug(slug) {
        const response = await catalogClient.get(`/categories/${slug}`);
        return normalizeCategory(response.data?.category);
    },
};
