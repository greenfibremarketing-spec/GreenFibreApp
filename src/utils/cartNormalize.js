import { normalizeProduct, resolveImageUrl } from './catalogNormalize';

export function getCartLineKey(productId, colorIndex) {
    return `${productId}:${colorIndex}`;
}

export function normalizeCartItem(rawItem) {
    if (!rawItem) {
        return null;
    }

    const rawProduct = rawItem.product;
    const productId = typeof rawProduct === 'object' && rawProduct !== null
        ? String(rawProduct._id || rawProduct.id)
        : String(rawItem.product || rawItem.productId || '');

    const colorIndex = rawItem.colorIndex ?? 0;
    const normalizedProduct = typeof rawProduct === 'object' && rawProduct !== null
        ? normalizeProduct(rawProduct)
        : null;

    let image = normalizedProduct?.image || null;
    if (rawProduct?.thumbnail) {
        image = resolveImageUrl(rawProduct.thumbnail);
    }
    else if (rawProduct?.image) {
        image = resolveImageUrl(rawProduct.image);
    }

    const availableStock = rawItem.availableStock
        ?? rawProduct?.colors?.[colorIndex]?.stock
        ?? normalizedProduct?.colors?.[colorIndex]?.stock;

    return {
        productId,
        colorIndex,
        colorName: rawItem.colorName || normalizedProduct?.colors?.[colorIndex]?.name || '',
        colorHex: rawItem.colorHex || normalizedProduct?.colors?.[colorIndex]?.hex || '',
        quantity: rawItem.quantity || 1,
        price: rawItem.price ?? normalizedProduct?.discountedPrice ?? normalizedProduct?.price ?? 0,
        product: normalizedProduct,
        availableStock,
        image,
        lineKey: getCartLineKey(productId, colorIndex),
    };
}

/**
 * Supports both GET /cart/ response shapes:
 * - empty: { success, items: [], totalAmount }
 * - populated: { success, cart: { items, totalAmount } }
 * Also supports mutation responses that return { cart: {...} }.
 */
export function normalizeCartResponse(responseData) {
    if (!responseData) {
        return { items: [], totalAmount: 0 };
    }

    const cartPayload = responseData.cart ?? responseData;
    const items = (cartPayload.items || [])
        .map((item) => normalizeCartItem(item))
        .filter(Boolean);

    return {
        items,
        totalAmount: cartPayload.totalAmount ?? 0,
    };
}

export function normalizeGuestCartItem(item) {
    return {
        productId: String(item.productId),
        colorIndex: Number(item.colorIndex) || 0,
        quantity: Number(item.quantity) || 1,
        lineKey: getCartLineKey(item.productId, item.colorIndex ?? 0),
    };
}
