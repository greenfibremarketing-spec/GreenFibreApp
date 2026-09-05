import { createSlice } from '@reduxjs/toolkit';
import {
    fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart as clearCartThunk,
    mergeCart,
    loadGuestCartState,
    addToGuestCart,
    updateGuestCartLine,
    removeGuestCartLine,
    clearGuestCartBuffer,
} from '../thunks/cartThunks';

const initialState = {
    items: [],
    guestItems: [],
    totalAmount: 0,
    loading: false,
    error: null,
    synced: false,
};

const applyCartPayload = (state, payload) => {
    state.items = payload.items;
    state.totalAmount = payload.totalAmount;
    state.synced = true;
    state.error = null;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        resetCartState: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.loading = false;
            state.error = null;
            state.synced = false;
        },
        clearCartDisplay: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.synced = false;
        },
        clearCartError: (state) => {
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
            state.error = action.payload || action.error?.message || 'Cart request failed';
        };
        const handleFulfilled = (state, action) => {
            state.loading = false;
            applyCartPayload(state, action.payload);
        };

        builder
            .addCase(fetchCart.pending, handlePending)
            .addCase(fetchCart.fulfilled, handleFulfilled)
            .addCase(fetchCart.rejected, handleRejected)
            .addCase(addToCart.pending, handlePending)
            .addCase(addToCart.fulfilled, handleFulfilled)
            .addCase(addToCart.rejected, handleRejected)
            .addCase(updateCartItem.pending, handlePending)
            .addCase(updateCartItem.fulfilled, handleFulfilled)
            .addCase(updateCartItem.rejected, handleRejected)
            .addCase(removeCartItem.pending, handlePending)
            .addCase(removeCartItem.fulfilled, handleFulfilled)
            .addCase(removeCartItem.rejected, handleRejected)
            .addCase(clearCartThunk.pending, handlePending)
            .addCase(clearCartThunk.fulfilled, handleFulfilled)
            .addCase(clearCartThunk.rejected, handleRejected)
            .addCase(mergeCart.pending, handlePending)
            .addCase(mergeCart.fulfilled, handleFulfilled)
            .addCase(mergeCart.rejected, handleRejected)
            .addCase(loadGuestCartState.fulfilled, (state, action) => {
                state.guestItems = action.payload;
            })
            .addCase(addToGuestCart.fulfilled, (state, action) => {
                state.guestItems = action.payload;
            })
            .addCase(updateGuestCartLine.fulfilled, (state, action) => {
                state.guestItems = action.payload;
            })
            .addCase(removeGuestCartLine.fulfilled, (state, action) => {
                state.guestItems = action.payload;
            })
            .addCase(clearGuestCartBuffer.fulfilled, (state) => {
                state.guestItems = [];
            });
    },
});

export const {
    resetCartState,
    clearCartDisplay,
    clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectGuestCartItems = (state) => state.cart.guestItems;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

export const selectAuthenticatedCartItemCount = (state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectGuestCartItemCount = (state) =>
    state.cart.guestItems.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartBadgeCount = (state) => {
    if (state.auth.isAuthenticated) {
        return selectAuthenticatedCartItemCount(state);
    }
    return selectGuestCartItemCount(state);
};

// Backward compatibility for CheckoutScreen (local display clear only).
export const clearCart = clearCartDisplay;

export const selectCartItemCount = selectCartBadgeCount;
