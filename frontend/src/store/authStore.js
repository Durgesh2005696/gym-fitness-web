import { create } from 'zustand';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || '') + '/api/auth';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, ...userData } = response.data;

            localStorage.setItem('token', token);
            set({
                user: userData,
                token: token,
                isAuthenticated: true,
                isLoading: false
            });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Login failed'
            });
            throw error;
        }
    },

    register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/register`, { name, email, password, role });
            // Depending on logic, might set user or require login. 
            // Backend returns token: null, so we don't set auth.
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Registration failed'
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => { // Verify token on load
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // We need an endpoint to verify token or just decode it.
                // Usually GET /me
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await axios.get(`${API_URL}/me`);
                set({ user: response.data, token, isAuthenticated: true });
            } catch (e) {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            }
        }
    }
}));

// Axios Interceptor for Expiry
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 403 && error.response.data.code === 'EXPIRED') {
            window.location.href = '/renew';
        }
        return Promise.reject(error);
    }
);

export default useAuthStore;
