import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login/', { email, password });
        if (response.data.access) {
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await api.post('/auth/register/', userData);
        return response.data;
    },

    logout: async () => {
        try {
            // Pass the refresh token so the server can blacklist it
            // Prevents the token from being reused after logout
            const refreshToken = localStorage.getItem('refresh_token');
            await api.post('/auth/logout/', { refresh: refreshToken });
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/profile/');
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/${token}/`);
        return response.data;
    },

    requestPasswordReset: async (email) => {
        const response = await api.post('/auth/password-reset/', { email });
        return response.data;
    },

    confirmPasswordReset: async (token, newPassword) => {
        const response = await api.post('/auth/password-reset/confirm/', {
            token,
            new_password: newPassword,
        });
        return response.data;
    },
};
