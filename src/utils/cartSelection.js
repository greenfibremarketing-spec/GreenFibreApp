export function getDefaultColorIndex(product) {
    if (!product?.colors?.length) {
        return 0;
    }
    return 0;
}

export function validateCartSelection(product, colorIndex = 0, quantity = 1) {
    if (!product) {
        return { ok: false, message: 'Product not available.' };
    }

    const safeColorIndex = (colorIndex === null || colorIndex === undefined || colorIndex < 0) ? 0 : colorIndex;
    const colors = product.colors || [];
    const selectedColor = colors[safeColorIndex] || colors[0] || { name: 'Standard', stock: product.stock ?? 100 };

    const availableStock = selectedColor.stock ?? product.stock ?? 100;

    if (availableStock <= 0) {
        return { ok: false, message: `${selectedColor.name || 'Item'} is out of stock.` };
    }

    if (quantity > availableStock) {
        return {
            ok: false,
            message: `Only ${availableStock} items available in ${selectedColor.name || 'stock'}.`,
        };
    }

    return { ok: true, colorIndex: safeColorIndex, quantity: Math.max(1, quantity), availableStock };
}
