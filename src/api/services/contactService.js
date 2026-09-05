import { authApiClient } from '../authClient';

function createContactError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message
        || (status === 429 ? 'Too many contact submissions. Please try again later.' : null)
        || (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null)
        || (error.message === 'Network Error' ? 'Unable to reach the server. Check your connection.' : null)
        || 'Unable to submit your message.';

    const contactError = new Error(message);
    contactError.status = status;
    contactError.data = error.response?.data;
    return contactError;
}

export const contactService = {
    async submitContactForm(data) {
        const name = data.fullName?.trim() || data.name?.trim() || '';
        const email = String(data.email || '').trim().toLowerCase();
        const phone = String(data.phone || '').replace(/\D/g, '').slice(-10);
        const message = String(data.message || '').trim();

        if (!name || !email || !phone || !message) {
            throw new Error('Please fill in all required fields');
        }

        try {
            const response = await authApiClient.post('/contact/contact', {
                name,
                phone,
                email,
                message,
            });
            return response.data;
        }
        catch (error) {
            throw createContactError(error);
        }
    },
};
