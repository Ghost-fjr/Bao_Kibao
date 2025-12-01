import api from './api';

export const tournamentService = {
    getAll: async () => {
        const response = await api.get('/tournaments/tournaments/');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/tournaments/tournaments/${id}/`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/tournaments/tournaments/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/tournaments/tournaments/${id}/`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/tournaments/tournaments/${id}/`);
        return response.data;
    },

    registerTeam: async (tournamentId, teamData) => {
        const response = await api.post(`/tournaments/tournaments/${tournamentId}/register_team/`, teamData);
        return response.data;
    },

    getStandings: async (tournamentId) => {
        const response = await api.get(`/tournaments/tournaments/${tournamentId}/standings/`);
        return response.data;
    },

    getMatches: async (tournamentId) => {
        const response = await api.get(`/tournaments/tournaments/${tournamentId}/matches/`);
        return response.data;
    },
};
