import { create } from 'zustand';
import { authService } from '../services/auth';

/**
 * Global authentication state store.
 * Replaces scattered localStorage reads and per-component useEffect auth calls.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout, isAdmin } = useAuthStore();
 */
export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    /**
     * Initialize auth state on app load.
     * Reads the stored token and fetches the current user profile.
     * Call once in main.jsx before rendering.
     */
    initialize: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch {
            // Token is invalid or expired — clear it
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    /**
     * Log in with email and password.
     * Fetches user profile immediately after to populate the store.
     */
    login: async (email, password) => {
        const data = await authService.login(email, password);
        try {
            const user = await authService.getCurrentUser();
            set({ user, isAuthenticated: true });
        } catch {
            // Login succeeded but profile fetch failed — still mark authenticated
            set({ isAuthenticated: true });
        }
        return data;
    },

    /**
     * Log out and clear all auth state.
     */
    logout: async () => {
        try {
            await authService.logout();
        } finally {
            set({ user: null, isAuthenticated: false });
        }
    },

    /**
     * Update the stored user profile (e.g., after profile edit).
     */
    updateUser: (updatedUser) => set({ user: updatedUser }),

    /**
     * Check if the current user has admin privileges.
     */
    isAdmin: () => {
        const { user } = get();
        return !!(user?.is_staff || user?.role === 'admin');
    },

    /**
     * Check if the current user has a specific role.
     */
    hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
    },
}));
