import axios from 'axios';
import { Platform } from 'react-native';
import {
    clearCookies,
    getCookieHeader,
    getMemoryCookies,
    loadCookies,
    parseSetCookieHeaders,
    saveCookies,
    TOKEN_COOKIE_NAME,
} from './cookieJar';

const DEFAULT_GREEN_FIBRE_API_URL = 'https://api.greenfibre.org/api';

export const getGreenFibreApiUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    return DEFAULT_GREEN_FIBRE_API_URL;
};

let cookieJarReady = false;

export async function ensureCookieJarReady() {
    if (!cookieJarReady) {
        await loadCookies();
        cookieJarReady = true;
    }
}

export function resetCookieJarReady() {
    cookieJarReady = false;
}

async function persistResponseCookies(headers) {
    const cookies = parseSetCookieHeaders(headers);
    if (Object.keys(cookies).length > 0) {
        await saveCookies(cookies);
    }
}

/**
 * Dedicated Axios client for Green Fibre authentication.
 * Uses both Cookie and Authorization Bearer headers for cross-platform reliability.
 */
export const authApiClient = axios.create({
    baseURL: getGreenFibreApiUrl(),
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

authApiClient.interceptors.request.use(async (config) => {
    await ensureCookieJarReady();
    const cookieHeader = getCookieHeader();
    if (cookieHeader) {
        config.headers.Cookie = cookieHeader;
    }
    const token = getMemoryCookies()[TOKEN_COOKIE_NAME];
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

authApiClient.interceptors.response.use(async (response) => {
    await persistResponseCookies(response.headers);
    if (response.data?.token) {
        await saveCookies({ [TOKEN_COOKIE_NAME]: response.data.token });
    }
    return response;
}, async (error) => {
    if (error.response?.headers) {
        await persistResponseCookies(error.response.headers);
    }

    if (error.response?.status === 401) {
        await clearCookies();
        cookieJarReady = false;
    }

    return Promise.reject(error);
});

export const getAuthTransportInfo = () => ({
    baseURL: getGreenFibreApiUrl(),
    platform: Platform.OS,
    strategy: 'manual-cookie-jar',
    withCredentials: false,
});
