import * as SecureStore from 'expo-secure-store';

export const COOKIE_STORE_KEY = 'gf_auth_cookies';
export const TOKEN_COOKIE_NAME = 'token';

let memoryCookies = {};

export async function loadCookies() {
    try {
        const raw = await SecureStore.getItemAsync(COOKIE_STORE_KEY);
        memoryCookies = raw ? JSON.parse(raw) : {};
    }
    catch {
        memoryCookies = {};
    }
    return { ...memoryCookies };
}

export async function saveCookies(cookies) {
    memoryCookies = { ...memoryCookies, ...cookies };
    try {
        await SecureStore.setItemAsync(COOKIE_STORE_KEY, JSON.stringify(memoryCookies));
    }
    catch (e) {
        // SecureStore may be unavailable or fail in some environments
    }
}

export async function clearCookies() {
    memoryCookies = {};
    try {
        await SecureStore.deleteItemAsync(COOKIE_STORE_KEY);
    }
    catch {
        // SecureStore may be unavailable in some environments.
    }
}

export function getMemoryCookies() {
    return { ...memoryCookies };
}

/**
 * Parse Set-Cookie response headers into a name -> value map.
 * React Native does not persist cookies automatically; we capture them here.
 */
export function parseSetCookieHeaders(headers) {
    if (!headers) {
        return {};
    }

    const setCookie = headers['set-cookie'] ?? headers['Set-Cookie'];
    if (!setCookie) {
        return {};
    }

    const cookieStrings = Array.isArray(setCookie) ? setCookie : [setCookie];
    const parsed = {};

    for (const cookieStr of cookieStrings) {
        const [pair, ...attributes] = cookieStr.split(';');
        const equalsIndex = pair.indexOf('=');
        if (equalsIndex <= 0) {
            continue;
        }

        const name = pair.slice(0, equalsIndex).trim();
        const value = pair.slice(equalsIndex + 1).trim();
        const isExpired = attributes.some((attribute) => {
            const normalized = attribute.trim().toLowerCase();
            return normalized === 'max-age=0' || normalized.startsWith('expires=');
        });

        if (!name) {
            continue;
        }

        if (!value || isExpired) {
            delete parsed[name];
            delete memoryCookies[name];
            continue;
        }

        parsed[name] = value;
    }

    return parsed;
}

export function getCookieHeader(cookies = memoryCookies) {
    const entries = Object.entries(cookies).filter(([, value]) => Boolean(value));
    if (!entries.length) {
        return null;
    }
    return entries.map(([name, value]) => `${name}=${value}`).join('; ');
}

export function hasAuthCookie(cookies = memoryCookies) {
    return Boolean(cookies[TOKEN_COOKIE_NAME]);
}
