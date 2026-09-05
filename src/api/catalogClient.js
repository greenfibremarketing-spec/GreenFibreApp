import axios from 'axios';
import { getGreenFibreApiUrl } from './authClient';

/**
 * Public catalog API client for products and categories.
 * Uses the real Green Fibre API base URL without authentication.
 */
export const catalogClient = axios.create({
    baseURL: getGreenFibreApiUrl(),
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

catalogClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message
            || (status === 429 ? 'Too many requests. Please try again later.' : null)
            || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
            || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
            || 'Something went wrong. Please try again.';

        const catalogError = new Error(message);
        catalogError.status = status;
        catalogError.code = error.response?.data?.code;
        catalogError.data = error.response?.data;
        return Promise.reject(catalogError);
    },
);

export default catalogClient;
