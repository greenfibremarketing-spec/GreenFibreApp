export const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
};
export const calculateCartTotal = (items, products) => {
    return items.reduce((total, item) => {
        const product = products.find((p) => p._id === item.productId);
        return total + (product?.price ?? 0) * item.quantity;
    }, 0);
};
export const getShippingCost = (subtotal) => {
    return subtotal >= 999 ? 0 : 99;
};
export const FREE_SHIPPING_THRESHOLD = 999;
