import { createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../api/services/cartService';
import {
    addGuestCartItem,
    clearGuestCart,
    loadGuestCart,
    removeGuestCartItem,
    updateGuestCartItem,
} from '../../utils/guestCartBuffer';

export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            return await cartService.getCart();
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load cart');
        }
    },
);

export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, colorIndex, quantity }, { rejectWithValue }) => {
        try {
            return await cartService.addToCart(productId, colorIndex, quantity);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to add to cart');
        }
    },
);

export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, colorIndex, quantity }, { rejectWithValue }) => {
        try {
            return await cartService.updateCartItem(productId, colorIndex, quantity);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to update cart');
        }
    },
);

export const removeCartItem = createAsyncThunk(
    'cart/removeCartItem',
    async ({ productId, colorIndex }, { rejectWithValue }) => {
        try {
            return await cartService.removeCartItem(productId, colorIndex);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to remove item');
        }
    },
);

export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            return await cartService.clearCart();
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to clear cart');
        }
    },
);

export const mergeCart = createAsyncThunk(
    'cart/mergeCart',
    async (items, { rejectWithValue }) => {
        try {
            return await cartService.mergeCart(items);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to merge cart');
        }
    },
);

export const loadGuestCartState = createAsyncThunk(
    'cart/loadGuestCartState',
    async () => loadGuestCart(),
);

export const addToGuestCart = createAsyncThunk(
    'cart/addToGuestCart',
    async ({ productId, colorIndex, quantity }) => addGuestCartItem({ productId, colorIndex, quantity }),
);

export const updateGuestCartLine = createAsyncThunk(
    'cart/updateGuestCartLine',
    async ({ productId, colorIndex, quantity }) => updateGuestCartItem({ productId, colorIndex, quantity }),
);

export const removeGuestCartLine = createAsyncThunk(
    'cart/removeGuestCartLine',
    async ({ productId, colorIndex }) => removeGuestCartItem({ productId, colorIndex }),
);

export const clearGuestCartBuffer = createAsyncThunk(
    'cart/clearGuestCartBuffer',
    async () => {
        await clearGuestCart();
        return [];
    },
);
