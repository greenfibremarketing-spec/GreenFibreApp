import axios from 'axios';
import { Platform } from 'react-native';
import {
    clearCookies,
    getCookieHeader,
    loadCookies,
    parseSetCookieHeaders,
    saveCookies,
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
 * Dedicated Axios client for Green Fibre cookie-based authentication.
 * Uses manual Cookie header injection because React Native does not
 * reliably persist HTTP-only cookies with withCredentials alone.
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
    return config;
});

authApiClient.interceptors.response.use(async (response) => {
    await persistResponseCookies(response.headers);
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
