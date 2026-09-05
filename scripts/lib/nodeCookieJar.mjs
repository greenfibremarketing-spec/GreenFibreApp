const COOKIE_STORE_KEY = 'gf_auth_cookies';
const TOKEN_COOKIE_NAME = 'token';

let memoryCookies = {};

export function resetCookieStore() {
    memoryCookies = {};
}

export function loadCookiesFromObject(cookies) {
    memoryCookies = { ...cookies };
    return { ...memoryCookies };
}

export function getMemoryCookies() {
    return { ...memoryCookies };
}

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
            return normalized === 'max-age=0';
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

export async function saveCookies(cookies) {
    memoryCookies = { ...memoryCookies, ...cookies };
}

export async function clearCookies() {
    memoryCookies = {};
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

export function createCookieAxios(axios, baseURL) {
    const client = axios.create({
        baseURL,
        timeout: 20000,
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: false,
        validateStatus: () => true,
    });

    client.interceptors.request.use(async (config) => {
        const cookieHeader = getCookieHeader();
        if (cookieHeader) {
            config.headers.Cookie = cookieHeader;
        }
        return config;
    });

    client.interceptors.response.use(async (response) => {
        const cookies = parseSetCookieHeaders(response.headers);
        if (Object.keys(cookies).length > 0) {
            await saveCookies(cookies);
        }
        return response;
    });

    return client;
}

export { COOKIE_STORE_KEY, TOKEN_COOKIE_NAME };
