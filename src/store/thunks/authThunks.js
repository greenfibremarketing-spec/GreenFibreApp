import { createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { greenFibreAuthService } from '../../api/services/greenFibreAuthService';
import { clearCookies, hasAuthCookie, loadCookies } from '../../api/cookieJar';
import { resetCookieJarReady } from '../../api/authClient';
import { normalizeAuthUser } from '../../utils/authUser';
import { loginSuccess, logout, restoreAuth, loginStart } from '../slices/authSlice';

export async function fetchAuthenticatedUser() {
    const profile = await greenFibreAuthService.getProfile();
    return normalizeAuthUser(profile.user);
}

export const restoreAuthSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, { dispatch }) => {
        dispatch(loginStart());
        await loadCookies();
        await AsyncStorage.removeItem('auth_token');

        if (!hasAuthCookie()) {
            dispatch(restoreAuth(null));
            return null;
        }

        try {
            const user = await fetchAuthenticatedUser();
            dispatch(restoreAuth({ user }));
            return user;
        }
        catch {
            await clearCookies();
            resetCookieJarReady();
            dispatch(restoreAuth(null));
            return null;
        }
    },
);

export const completeAuthentication = createAsyncThunk(
    'auth/completeAuthentication',
    async (fallbackUser, { dispatch }) => {
        try {
            const user = await fetchAuthenticatedUser();
            dispatch(loginSuccess({ user }));
            return user;
        } catch (err) {
            if (fallbackUser) {
                const normalized = normalizeAuthUser(fallbackUser?.user || fallbackUser);
                dispatch(loginSuccess({ user: normalized }));
                return normalized;
            }
            throw err;
        }
    },
);

export const performLogout = createAsyncThunk(
    'auth/performLogout',
    async (_, { dispatch }) => {
        try {
            await greenFibreAuthService.logout();
        }
        catch {
            await clearCookies();
            resetCookieJarReady();
        }

        await AsyncStorage.removeItem('auth_token');
        dispatch(logout());
    },
);
