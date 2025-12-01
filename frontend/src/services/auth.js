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
            await api.post('/auth/logout/');
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
        }
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/profile/');
        return response.data;
    },
};
