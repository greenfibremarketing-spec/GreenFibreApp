import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import ordersReducer from './slices/ordersSlice';
import wishlistReducer from './slices/wishlistSlice';
import uiReducer from './slices/uiSlice';
import 'react-native-gesture-handler';
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    // auth is intentionally excluded: user PII (name, email, phone) must not be
    // stored in unencrypted AsyncStorage. Session is restored via the SecureStore-backed
    // cookie jar (expo-secure-store) → API call in restoreAuthSession thunk.
    whitelist: ['ui'],
};
const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
});
export const persistor = persistStore(store);
