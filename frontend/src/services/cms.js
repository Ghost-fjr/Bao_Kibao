import api from './api';

export const cmsService = {
    // Get page by slug
    getPage: async (slug) => {
        const response = await api.get(`/cms/pages/${slug}/`);
        return response.data;
    },

    // Get all achievements
    getAchievements: async () => {
        const response = await api.get('/cms/achievements/');
        return response.data;
    },

    // Get media gallery
    getGallery: async () => {
        const response = await api.get('/cms/gallery/');
        return response.data;
    }
};
