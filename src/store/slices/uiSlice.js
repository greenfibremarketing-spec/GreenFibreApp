import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    hasSeenOnboarding: false,
    offerBarIndex: 0,
    isDrawerOpen: false,
    globalLoading: false,
    toast: null,
};
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setHasSeenOnboarding: (state, action) => {
            state.hasSeenOnboarding = action.payload;
        },
        setOfferBarIndex: (state, action) => {
            state.offerBarIndex = action.payload;
        },
        setDrawerOpen: (state, action) => {
            state.isDrawerOpen = action.payload;
        },
        setGlobalLoading: (state, action) => {
            state.globalLoading = action.payload;
        },
        showToast: (state, action) => {
            state.toast = action.payload;
        },
        hideToast: (state) => {
            state.toast = null;
        },
    },
});
export const { setHasSeenOnboarding, setOfferBarIndex, setDrawerOpen, setGlobalLoading, showToast, hideToast, } = uiSlice.actions;
export default uiSlice.reducer;
