import { createSlice } from '@reduxjs/toolkit';
import {
    fetchWishlist,
    toggleWishlist,
    removeFromWishlist,
} from '../thunks/wishlistThunks';

const initialState = {
    products: [],
    productIds: [],
    loading: false,
    error: null,
    synced: false,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        resetWishlistState: (state) => {
            state.products = [];
            state.productIds = [];
            state.loading = false;
            state.error = null;
            state.synced = false;
        },
        clearWishlistError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error?.message || 'Wishlist request failed';
        };
        const applyWishlistPayload = (state, payload) => {
            state.products = payload.products || [];
            state.productIds = payload.productIds || [];
            state.synced = true;
            state.loading = false;
            state.error = null;
        };

        builder
            .addCase(fetchWishlist.pending, handlePending)
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                applyWishlistPayload(state, action.payload);
            })
            .addCase(fetchWishlist.rejected, handleRejected)
            .addCase(toggleWishlist.pending, handlePending)
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                applyWishlistPayload(state, action.payload);
            })
            .addCase(toggleWishlist.rejected, handleRejected)
            .addCase(removeFromWishlist.pending, handlePending)
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                applyWishlistPayload(state, action.payload);
            })
            .addCase(removeFromWishlist.rejected, handleRejected);
    },
});

export const {
    resetWishlistState,
    clearWishlistError,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

export const selectWishlistProducts = (state) => state.wishlist.products;
export const selectWishlistItems = (state) => state.wishlist.productIds;
export const selectWishlistCount = (state) => state.wishlist.productIds.length;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectIsInWishlist = (productId) => (state) =>
    state.wishlist.productIds.includes(String(productId));

// Backward-compatible alias used by WishlistScreen clear-all flow.
export const clearWishlist = resetWishlistState;
