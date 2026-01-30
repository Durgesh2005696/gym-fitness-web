import { create } from 'zustand';
import api from '../utils/api';

const API_URL = '/auth';

const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/login`, { email, password });
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

    register: async (name, email, password, role = 'CLIENT') => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/register`, { name, email, password, role });
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

    registerTrainer: async (name, email, password, specialization, bio) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`${API_URL}/register-trainer`, {
                name, email, password, specialization, bio
            });
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || 'Trainer registration failed'
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Force timeout if server is dead
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout')), 5000)
                );

                const response = await Promise.race([
                    api.get(`${API_URL}/me`),
                    timeoutPromise
                ]);

                set({ user: response.data, token, isAuthenticated: true, isCheckingAuth: false });
            } catch (e) {
                console.error("Auth check failed:", e);
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
            }
        } else {
            set({ isCheckingAuth: false });
        }
    },

    // Refresh user data from server
    refreshUser: async () => {
        try {
            const response = await api.get(`${API_URL}/me`);
            set({ user: response.data });
            return response.data;
        } catch (e) {
            console.error("Failed to refresh user:", e);
            throw e;
        }
    },

    // Update trainer's QR code
    updateTrainerQR: async (paymentQrCode) => {
        try {
            const response = await api.put(`${API_URL}/update-qr`, { paymentQrCode });
            const user = get().user;
            if (user) {
                set({ user: { ...user, paymentQrCode } });
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Helper getters for access control
    isTrainerActive: () => {
        const user = get().user;
        return user?.role === 'TRAINER' && user?.accountStatus === 'ACTIVE';
    },

    isTrainerPending: () => {
        const user = get().user;
        return user?.role === 'TRAINER' &&
            (user?.accountStatus === 'PENDING' || user?.accountStatus === 'PAYMENT_SUBMITTED');
    },

    isClientActive: () => {
        const user = get().user;
        return user?.role === 'CLIENT' && user?.profile?.activationStatus === 'ACTIVE';
    },

    isClientRegistered: () => {
        const user = get().user;
        return user?.role === 'CLIENT' && user?.profile?.activationStatus === 'REGISTERED';
    },

    hasAssignedTrainer: () => {
        const user = get().user;
        return user?.role === 'CLIENT' && !!user?.profile?.trainerId;
    },

    getClientActivationStatus: () => {
        const user = get().user;
        return user?.profile?.activationStatus || 'REGISTERED';
    }
}));

export default useAuthStore;
