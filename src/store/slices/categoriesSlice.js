import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../api/services/categoryService';

const initialState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await categoryService.getCategories();
        }
        catch (error) {
            return rejectWithValue(error.message || 'Failed to load categories');
        }
    },
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoriesError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load categories';
            });
    },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
