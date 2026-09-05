import { createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../api/services/wishlistService';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            return await wishlistService.getWishlist();
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load wishlist');
        }
    },
);

export const toggleWishlist = createAsyncThunk(
    'wishlist/toggleWishlist',
    async (productId, { rejectWithValue, dispatch }) => {
        try {
            const result = await wishlistService.toggleWishlist(productId);
            const wishlist = await wishlistService.getWishlist();
            return { ...result, ...wishlist };
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to update wishlist');
        }
    },
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/removeFromWishlist',
    async (productId, { rejectWithValue }) => {
        try {
            return await wishlistService.removeFromWishlist(productId);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to remove from wishlist');
        }
    },
);
