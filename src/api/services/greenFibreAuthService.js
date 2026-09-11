import { authApiClient } from '../authClient';
import { clearCookies, hasAuthCookie, resetCookieJarReady, saveAuthToken } from '../cookieJar';

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
    async register({ full_name, name, email, phone, password }) {
        try {
            const userName = (full_name || name || '').trim();
            const cleanPhone = phone ? String(phone).replace(/\D/g, '') : undefined;
            const response = await authApiClient.post('/users/register', {
                full_name: userName,
                name: userName,
                email: normalizeEmail(email),
                phone: cleanPhone || undefined,
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
            const token = response.data?.token || response.data?.data?.token || response.data?.accessToken;
            if (token) {
                await saveAuthToken(token);
            }
            return {
                ...response.data,
                token: token || undefined,
                authenticated: true,
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
            const token = response.data?.token || response.data?.data?.token || response.data?.accessToken;
            if (token) {
                await saveAuthToken(token);
            }
            return {
                ...response.data,
                token: token || undefined,
                authenticated: true,
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

    async deleteAccount() {
        try {
            let response;
            try {
                response = await authApiClient.delete('/users/me');
            } catch (err) {
                if (err.response?.status === 404 || err.response?.status === 405) {
                    response = await authApiClient.post('/users/delete-account');
                } else {
                    throw err;
                }
            }
            return response?.data || { success: true };
        } catch (error) {
            if (error.response?.status === 401) {
                return { success: true };
            }
            throw toAuthError(error, 'Unable to delete your account. Please try again or contact support.');
        } finally {
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
