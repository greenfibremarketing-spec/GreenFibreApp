export function getDefaultColorIndex(product) {
    if (!product?.colors?.length) {
        return null;
    }
    return 0;
}

export function validateCartSelection(product, colorIndex, quantity = 1) {
    if (!product) {
        return { ok: false, message: 'Product not available.' };
    }

    if (!product.colors?.length) {
        return {
            ok: false,
            message: 'This product has no color variants and cannot be added to cart yet.',
        };
    }

    if (colorIndex === null || colorIndex === undefined || !product.colors[colorIndex]) {
        return { ok: false, message: 'Please select a valid color.' };
    }

    const selectedColor = product.colors[colorIndex];
    const availableStock = selectedColor.stock ?? 0;

    if (availableStock <= 0) {
        return { ok: false, message: `${selectedColor.name} is out of stock.` };
    }

    if (quantity > availableStock) {
        return {
            ok: false,
            message: `Only ${availableStock} items available in ${selectedColor.name}.`,
        };
    }

    return { ok: true, colorIndex, quantity, availableStock };
}
