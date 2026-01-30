import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const errorCode = error.response?.data?.code;
        const errorMessage = error.response?.data?.message;

        // 401 Unauthorized - Session expired or invalid token
        if (status === 401) {
            console.warn('AUTH: Session expired or invalid. Logging out.');
            localStorage.removeItem('token');
            // Redirect to login with reason
            window.location.href = '/login?reason=session_expired';
            return Promise.reject(error);
        }

        // 403 Forbidden - Subscription expired (handles both trainer and client)
        if (status === 403 && (errorCode === 'EXPIRED' || errorCode === 'TRAINER_EXPIRED' || errorCode === 'CLIENT_EXPIRED')) {
            window.location.href = '/renew';
            return Promise.reject(error);
        }

        // 403 Forbidden - Access denied (ownership/permission issue)
        if (status === 403) {
            console.error('PERMISSION DENIED:', errorMessage || 'You do not have access to this resource.');
            // Optionally: Show a toast notification here if you have a toast system
            // toast.error(errorMessage || 'Access Denied');
        }

        return Promise.reject(error);
    }
);

export default api;
