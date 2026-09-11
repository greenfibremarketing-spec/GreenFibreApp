import { resolveImageUrl } from './catalogNormalize';

function normalizeOrderItem(item) {
    if (!item) {
        return null;
    }

    const productId = typeof item.product === 'object' && item.product !== null
        ? String(item.product._id || item.product.id)
        : String(item.product || item.productId || '');

    return {
        ...item,
        productId,
        product: item.product,
        name: item.name || '',
        image: resolveImageUrl(item.image) || item.image || null,
        colorIndex: item.colorIndex ?? 0,
        colorName: item.colorName || '',
        colorHex: item.colorHex || '',
        quantity: item.quantity || 1,
        price: item.price ?? 0,
    };
}

export function normalizeOrder(rawOrder) {
    if (!rawOrder) {
        return null;
    }

    const order = rawOrder.order ? rawOrder.order : rawOrder;
    const items = (order.items || [])
        .map((item) => normalizeOrderItem(item))
        .filter(Boolean);

    const finalAmount = order.finalAmount ?? order.totalAmount ?? 0;
    const orderStatus = order.orderStatus || 'placed';
    const paymentStatus = order.paymentStatus || 'pending';

    return {
        ...order,
        _id: order._id || order.id,
        razorpayOrderId: order.razorpayOrderId || '',
        orderNumber: order.orderNumber || order.razorpayOrderId || order._id || order.id,
        totalAmount: order.totalAmount ?? 0,
        discountAmount: order.discountAmount ?? 0,
        finalAmount,
        total: finalAmount,
        paymentMethod: order.paymentMethod || 'Razorpay',
        paymentStatus,
        orderStatus,
        status: orderStatus,
        shippingAddress: order.shippingAddress || {},
        shippingDetails: order.shippingDetails || {},
        statusHistory: order.statusHistory || [],
        items,
        transactionId: order.transactionId || '',
        couponCode: order.couponCode,
        invoiceUrl: order.invoiceUrl,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    };
}

export function normalizeOrderListResponse(responseData) {
    const orders = (responseData?.orders || [])
        .map((order) => normalizeOrder(order))
        .filter(Boolean);

    return {
        orders,
        pagination: responseData?.pagination || {
            page: 1,
            limit: orders.length,
            total: orders.length,
            pages: 1,
        },
    };
}

export function normalizeCreateOrderResponse(responseData) {
    return {
        success: Boolean(responseData?.success),
        message: responseData?.message || '',
        order: normalizeOrder(responseData?.order),
        paymentData: responseData?.paymentData || null,
    };
}

export function buildShippingAddressFromForm(form) {
    if (!form) return {};
    
    // Combine house/flat/building and street/area if separated
    const fullStreetAddress = [
        form.houseNo?.trim(),
        form.street?.trim() || form.addressLine1?.trim() || form.streetAddress?.trim()
    ].filter(Boolean).join(', ');

    return {
        fullName: form.fullName?.trim() || '',
        phone: String(form.phone || '').replace(/\D/g, '').slice(-10),
        companyName: form.companyName?.trim() || form.addressType || '',
        streetAddress: fullStreetAddress || form.addressLine1?.trim() || form.streetAddress?.trim() || '',
        landmark: form.landmark?.trim() || form.addressLine2?.trim() || '',
        city: form.city?.trim() || '',
        state: form.state?.trim() || '',
        pincode: String(form.pinCode || form.pincode || '').replace(/\D/g, '').slice(0, 6),
        email: form.email?.trim() || '',
        deliveryInstructions: form.deliveryInstructions?.trim() || '',
    };
}
