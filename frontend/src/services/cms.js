import api from './api';

export const cmsService = {
    // Get page by ID
    getPage: async (id) => {
        const response = await api.get(`/cms/pages/${id}/`);
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
    },

    // Get gallery collections
    getGalleryCollections: async () => {
        const response = await api.get('/cms/gallery-collections/');
        return response.data;
    }
};
