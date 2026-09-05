import axios from 'axios';
import { getGreenFibreApiUrl } from '../authClient';
import { normalizeOrder } from '../../utils/orderNormalize';

function createPaymentError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message
        || (status === 400 ? 'Payment could not be verified.' : null)
        || (status === 429 ? 'Too many verification attempts. Please try again later.' : null)
        || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
        || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
        || 'Payment verification failed. Please try again.';

    const paymentError = new Error(message);
    paymentError.status = status;
    paymentError.data = error.response?.data;
    paymentError.success = error.response?.data?.success === true;
    return paymentError;
}

/**
 * Payment Service — supports Razorpay (primary live) and Easebuzz (legacy).
 */
export const paymentService = {
    async verifyRazorpayPayment(payload) {
        try {
            const response = await axios.post(
                `${getGreenFibreApiUrl()}/verify-payment`,
                payload,
                {
                    timeout: 20000,
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            return {
                success: Boolean(response.data?.success),
                message: response.data?.message || '',
                orderId: response.data?.orderId,
                order: response.data?.order
                    ? normalizeOrder(response.data.order)
                    : null,
                data: response.data,
            };
        }
        catch (error) {
            throw createPaymentError(error);
        }
    },

    async verifyPayment(payload) {
        // If payload is for Razorpay, route to Razorpay verification
        if (payload?.razorpay_order_id || payload?.razorpay_payment_id || payload?.razorpay_signature) {
            return this.verifyRazorpayPayment(payload);
        }

        try {
            const response = await axios.post(
                `${getGreenFibreApiUrl()}/order/verify`,
                payload,
                {
                    timeout: 20000,
                    headers: { 'Content-Type': 'application/json' },
                },
            );

            return {
                success: Boolean(response.data?.success),
                message: response.data?.message || '',
                orderId: response.data?.orderId,
                order: response.data?.order
                    ? normalizeOrder(response.data.order)
                    : null,
            };
        }
        catch (error) {
            throw createPaymentError(error);
        }
    },
};
