import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCartLineKey, normalizeGuestCartItem } from './cartNormalize';

const GUEST_CART_KEY = 'guest_cart_buffer';

export async function loadGuestCart() {
    try {
        const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
        if (!raw) {
            return [];
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.map(normalizeGuestCartItem);
    }
    catch {
        return [];
    }
}

export async function saveGuestCart(items) {
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export async function clearGuestCart() {
    await AsyncStorage.removeItem(GUEST_CART_KEY);
}

export async function addGuestCartItem({ productId, colorIndex, quantity }) {
    const items = await loadGuestCart();
    const lineKey = getCartLineKey(productId, colorIndex);
    const existing = items.find((item) => item.lineKey === lineKey);

    if (existing) {
        existing.quantity += quantity;
    }
    else {
        items.push(normalizeGuestCartItem({ productId, colorIndex, quantity }));
    }

    await saveGuestCart(items);
    return items;
}

export async function updateGuestCartItem({ productId, colorIndex, quantity }) {
    const items = await loadGuestCart();
    const lineKey = getCartLineKey(productId, colorIndex);

    if (quantity <= 0) {
        const nextItems = items.filter((item) => item.lineKey !== lineKey);
        await saveGuestCart(nextItems);
        return nextItems;
    }

    const existing = items.find((item) => item.lineKey === lineKey);
    if (existing) {
        existing.quantity = quantity;
    }
    else {
        items.push(normalizeGuestCartItem({ productId, colorIndex, quantity }));
    }

    await saveGuestCart(items);
    return items;
}

export async function removeGuestCartItem({ productId, colorIndex }) {
    const items = await loadGuestCart();
    const lineKey = getCartLineKey(productId, colorIndex);
    const nextItems = items.filter((item) => item.lineKey !== lineKey);
    await saveGuestCart(nextItems);
    return nextItems;
}
