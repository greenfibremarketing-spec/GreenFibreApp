import { createAsyncThunk } from '@reduxjs/toolkit';
import { loadGuestCart, clearGuestCart } from '../../utils/guestCartBuffer';
import { fetchCart, mergeCart, loadGuestCartState } from './cartThunks';
import { fetchWishlist } from './wishlistThunks';
import { resetCartState } from '../slices/cartSlice';
import { resetWishlistState } from '../slices/wishlistSlice';

export const syncSessionAfterAuth = createAsyncThunk(
    'session/syncAfterAuth',
    async (_, { dispatch }) => {
        try {
            const guestItems = await loadGuestCart();
            if (guestItems.length > 0) {
                try {
                    await dispatch(mergeCart(guestItems.map((item) => ({
                        productId: item.productId,
                        colorIndex: item.colorIndex,
                        quantity: item.quantity,
                    })))).unwrap();
                    await clearGuestCart();
                } catch {
                    // Continue even if merge has minor issues
                }
            }

            try {
                await dispatch(fetchCart()).unwrap();
            } catch {
                // Ignore
            }

            try {
                await dispatch(fetchWishlist()).unwrap();
            } catch {
                // Ignore
            }
        } catch {
            // General catch
        }
    },
);

export const clearSessionCartWishlist = createAsyncThunk(
    'session/clearOnLogout',
    async (_, { dispatch }) => {
        dispatch(resetCartState());
        dispatch(resetWishlistState());
        await dispatch(loadGuestCartState());
    },
);

export const loadGuestCartForDisplay = createAsyncThunk(
    'session/loadGuestCartForDisplay',
    async (_, { dispatch }) => {
        await dispatch(loadGuestCartState());
    },
);
