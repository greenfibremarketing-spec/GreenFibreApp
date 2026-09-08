const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';

/**
 * Returns the server origin (e.g. "http://192.168.1.33:5500") by stripping the
 * /api path segment from EXPO_PUBLIC_API_URL. Falls back to the production host.
 */
function getServerOrigin() {
    try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.greenfibre.org/api';
        const url = new URL(apiUrl);
        return url.origin; // e.g. "http://192.168.1.33:5500"
    } catch {
        return 'https://api.greenfibre.org';
    }
}

/**
 * Converts a possibly-relative image path to an absolute URL.
 * Handles paths like "/products/img.jpg" or "products/img.jpg" or full URLs.
 */
function toAbsoluteUrl(path) {
    if (!path || typeof path !== 'string') return null;
    const trimmed = path.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${getServerOrigin()}${cleanPath}`;
}

export function resolveImageUrl(image) {
    if (!image) return null;

    if (typeof image === 'string') {
        return toAbsoluteUrl(image);
    }

    if (typeof image === 'object') {
        const path = image.thumbnail
            || image.card
            || image.medium
            || image.large
            || image.original
            || null;
        return toAbsoluteUrl(path);
    }

    return null;
}

function sumColorStock(colors = []) {
    return colors.reduce((total, color) => total + (color?.stock || 0), 0);
}

export function getColorImages(color) {
    if (!color?.images?.length) {
        return [];
    }

    return color.images
        .map((image) => resolveImageUrl(image))
        .filter(Boolean);
}

export function getProductGalleryImages(product, colorIndex = 0) {
    const selectedColorImages = getColorImages(product?.colors?.[colorIndex]);
    if (selectedColorImages.length > 0) {
        return selectedColorImages;
    }

    const allImages = (product?.colors || [])
        .flatMap((color) => getColorImages(color));

    if (allImages.length > 0) {
        return allImages;
    }

    const fallback = resolveImageUrl(product?.image);
    return fallback ? [fallback] : [];
}

export function getProductCardImage(product, colorIndex = 0) {
    const gallery = getProductGalleryImages(product, colorIndex);
    return gallery[0] || PLACEHOLDER_IMAGE;
}

export function normalizeCategory(rawCategory) {
    if (!rawCategory) {
        return null;
    }

    const imageUrl = resolveImageUrl(rawCategory.image);

    return {
        ...rawCategory,
        _id: rawCategory._id || rawCategory.id,
        id: rawCategory._id || rawCategory.id,
        name: rawCategory.name,
        slug: rawCategory.slug,
        description: rawCategory.description || '',
        image: imageUrl,
        imageUrl,
        parentCategory: rawCategory.parentCategory || null,
        displayOrder: rawCategory.displayOrder ?? 0,
        isFeatured: Boolean(rawCategory.isFeatured),
        isActive: rawCategory.isActive !== false,
    };
}

export function normalizeProduct(rawProduct) {
    if (!rawProduct) {
        return null;
    }

    const product = rawProduct.product ? rawProduct.product : rawProduct;
    const category = typeof product.category === 'object' && product.category !== null
        ? product.category
        : null;
    const subCategory = typeof product.subCategory === 'object' && product.subCategory !== null
        ? product.subCategory
        : null;
    const totalStock = product.totalStock ?? sumColorStock(product.colors);
    const galleryImages = getProductGalleryImages(product, 0);
    const cardImage = getProductCardImage(product, 0);

    const normalizedColors = (product.colors || []).map((color) => ({
        ...color,
        images: getColorImages(color),
    }));

    const featuresList = Array.isArray(product.features)
        ? product.features
        : product.features && typeof product.features === 'object'
            ? Object.values(product.features).filter(Boolean)
            : [];

    return {
        ...product,
        _id: product._id || product.id,
        id: product._id || product.id,
        slug: product.slug,
        name: product.name,
        description: product.description || '',
        price: product.discountedPrice,
        discountedPrice: product.discountedPrice,
        originalPrice: product.originalPrice,
        colors: normalizedColors,
        category,
        subCategory,
        categorySlug: category?.slug || product.categorySlug || '',
        categoryName: category?.name || (typeof product.category === 'string' ? product.category : ''),
        subCategorySlug: subCategory?.slug || '',
        subCategoryName: subCategory?.name || '',
        image: cardImage,
        images: galleryImages,
        rating: product.averageRating ?? product.rating ?? 0,
        averageRating: product.averageRating ?? product.rating ?? 0,
        reviewCount: product.reviewCount ?? 0,
        totalStock,
        inStock: totalStock > 0,
        isFeatured: Boolean(product.isFeatured),
        isActive: product.isActive !== false,
        features: product.features || {},
        featuresList,
        materialInfo: product.materialInfo || {},
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        metaKeywords: product.metaKeywords || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };
}

export function normalizeProductListResponse(responseData) {
    const products = (responseData?.products || [])
        .map((product) => normalizeProduct(product))
        .filter(Boolean);

    return {
        products,
        pagination: responseData?.pagination || {
            page: 1,
            limit: products.length,
            total: products.length,
            pages: 1,
        },
        query: responseData?.query,
    };
}

export { PLACEHOLDER_IMAGE };
