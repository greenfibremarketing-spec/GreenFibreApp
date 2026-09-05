import { authApiClient } from '../authClient';
import { clearCookies, hasAuthCookie, resetCookieJarReady, saveCookies, TOKEN_COOKIE_NAME } from '../cookieJar';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => email.trim().toLowerCase();

const toAuthError = (error, fallbackMessage) => {
    const payload = error.response?.data;
    const authError = new Error(payload?.message || fallbackMessage);
    authError.status = error.response?.status;
    authError.code = payload?.code;
    authError.data = payload;
    return authError;
};

export const greenFibreAuthService = {
    async register({ full_name, email, phone, password }) {
        try {
            const response = await authApiClient.post('/users/register', {
                full_name,
                email: normalizeEmail(email),
                phone,
                password,
            });
            return response.data;
        }
        catch (error) {
            throw toAuthError(error, 'Unable to create your account.');
        }
    },

    async verifyOtp({ email, otp }) {
        try {
            const response = await authApiClient.post('/users/verify-otp', {
                email: normalizeEmail(email),
                otp: String(otp).trim(),
            });
            if (response.data?.token) {
                await saveCookies({ [TOKEN_COOKIE_NAME]: response.data.token });
            }
            return {
                ...response.data,
                authenticated: hasAuthCookie() || Boolean(response.data?.token),
            };
        }
        catch (error) {
            throw toAuthError(error, 'Unable to verify your email.');
        }
    },

    async resendOtp(email) {
        try {
            const response = await authApiClient.post('/users/resend-otp', {
                email: normalizeEmail(email),
            });
            return response.data;
        }
        catch (error) {
            throw toAuthError(error, 'Unable to resend verification code.');
        }
    },

    async login({ email, password }) {
        try {
            const response = await authApiClient.post('/users/login', {
                email: normalizeEmail(email),
                password,
            });
            if (response.data?.token) {
                await saveCookies({ [TOKEN_COOKIE_NAME]: response.data.token });
            }
            return {
                ...response.data,
                authenticated: hasAuthCookie() || Boolean(response.data?.token),
            };
        }
        catch (error) {
            throw toAuthError(error, 'Unable to sign in right now.');
        }
    },

    async logout() {
        try {
            const response = await authApiClient.post('/users/logout');
            return response.data;
        }
        finally {
            await clearCookies();
            resetCookieJarReady();
        }
    },

    async getProfile() {
        try {
            const response = await authApiClient.get('/users/me');
            return response.data;
        }
        catch (error) {
            throw toAuthError(error, 'Unable to fetch profile.');
        }
    },

    async forgotPassword(email) {
        const response = await authApiClient.post('/users/forgot-password', {
            email: normalizeEmail(email),
        });
        return response.data;
    },

    async resetPassword({ email, otp, password }) {
        const response = await authApiClient.post('/users/reset-password', {
            email: normalizeEmail(email),
            otp: String(otp).trim(),
            password,
        });
        return response.data;
    },

    isAuthenticated() {
        return hasAuthCookie();
    },

    validateEmail(email) {
        return emailPattern.test(email.trim());
    },
};
