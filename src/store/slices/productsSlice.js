import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../api/services/productService';

const initialState = {
    products: [],
    featured: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    },
    loading: false,
    error: null,
    selectedCategory: 'all',
};

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            return await productService.getProducts(params);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load products');
        }
    },
);

export const fetchProductsByCategory = createAsyncThunk(
    'products/fetchByCategory',
    async ({ categorySlug, params = {} }, { rejectWithValue }) => {
        try {
            return await productService.getProductsByCategory(categorySlug, params);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load products');
        }
    },
);

export const searchProducts = createAsyncThunk(
    'products/search',
    async ({ query, params = {} }, { rejectWithValue }) => {
        try {
            return await productService.searchProducts(query, params);
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to search products');
        }
    },
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        clearProductsError: (state) => {
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
            state.error = action.payload || action.error?.message || 'Failed to load products';
        };
        const handleFulfilled = (state, action) => {
            state.loading = false;
            state.products = action.payload.products;
            state.pagination = action.payload.pagination;
            state.featured = action.payload.products.filter((product) => product.isFeatured).slice(0, 4);
        };

        builder
            .addCase(fetchProducts.pending, handlePending)
            .addCase(fetchProducts.fulfilled, handleFulfilled)
            .addCase(fetchProducts.rejected, handleRejected)
            .addCase(fetchProductsByCategory.pending, handlePending)
            .addCase(fetchProductsByCategory.fulfilled, handleFulfilled)
            .addCase(fetchProductsByCategory.rejected, handleRejected)
            .addCase(searchProducts.pending, handlePending)
            .addCase(searchProducts.fulfilled, handleFulfilled)
            .addCase(searchProducts.rejected, handleRejected);
    },
});

export const { setSelectedCategory, clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
