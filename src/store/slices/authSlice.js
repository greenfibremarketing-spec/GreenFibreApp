import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    hydrated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
            state.hydrated = true;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.hydrated = true;
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        updateProfile: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        restoreAuth: (state, action) => {
            if (action.payload?.user) {
                state.user = action.payload.user;
                state.isAuthenticated = true;
            }
            else {
                state.user = null;
                state.isAuthenticated = false;
            }
            state.loading = false;
            state.error = null;
            state.hydrated = true;
        },
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearAuthError,
    updateProfile,
    restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;
