import { createSlice } from '@reduxjs/toolkit';
import {
    fetchMyOrders,
    fetchOrderById,
    createOrder,
    verifyOrderPayment,
} from '../thunks/orderThunks';

const initialState = {
    orders: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    currentOrder: null,
    pendingPayment: null,
    loading: false,
    error: null,
};

const ordersSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        clearOrdersError: (state) => {
            state.error = null;
        },
        clearPendingPayment: (state) => {
            state.pendingPayment = null;
        },
        setPendingPayment: (state, action) => {
            state.pendingPayment = action.payload;
        },
    },
    extraReducers: (builder) => {
        const handlePending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const handleRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload || action.error?.message || 'Order request failed';
        };

        builder
            .addCase(fetchMyOrders.pending, handlePending)
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.orders;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchMyOrders.rejected, handleRejected)
            .addCase(fetchOrderById.pending, handlePending)
            .addCase(fetchOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderById.rejected, handleRejected)
            .addCase(createOrder.pending, handlePending)
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingPayment = action.payload;
                if (action.payload.order) {
                    state.currentOrder = action.payload.order;
                }
            })
            .addCase(createOrder.rejected, handleRejected)
            .addCase(verifyOrderPayment.pending, handlePending)
            .addCase(verifyOrderPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingPayment = null;
                if (action.payload.order) {
                    state.currentOrder = action.payload.order;
                }
                if (action.payload.orderId) {
                    const orderId = action.payload.orderId;
                    const updatedOrder = action.payload.order || state.currentOrder;
                    const existingIndex = state.orders.findIndex(
                        (order) => order._id === orderId,
                    );
                    if (updatedOrder && existingIndex >= 0) {
                        state.orders[existingIndex] = updatedOrder;
                    }
                    else if (updatedOrder) {
                        state.orders.unshift(updatedOrder);
                    }
                }
            })
            .addCase(verifyOrderPayment.rejected, handleRejected);
    },
});

export const {
    clearCurrentOrder,
    clearOrdersError,
    clearPendingPayment,
    setPendingPayment,
} = ordersSlice.actions;

export default ordersSlice.reducer;

export const selectOrders = (state) => state.orders.orders;
export const selectOrdersPagination = (state) => state.orders.pagination;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectPendingPayment = (state) => state.orders.pendingPayment;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;

export {
    fetchMyOrders,
    fetchOrderById,
    createOrder,
    verifyOrderPayment,
    fetchOrders,
} from '../thunks/orderThunks';
