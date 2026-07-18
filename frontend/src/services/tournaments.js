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

    // Team management
    getTeams: async (tournamentId, page = 1) => {
        const response = await api.get(`/tournaments/tournaments/${tournamentId}/teams/?page=${page}`);
        return response.data;
    },

    approveTeam: async (teamId) => {
        const response = await api.post(`/tournaments/teams/${teamId}/approve/`);
        return response.data;
    },

    rejectTeam: async (teamId) => {
        const response = await api.post(`/tournaments/teams/${teamId}/reject/`);
        return response.data;
    },

    updateTeam: async (teamId, data) => {
        const response = await api.put(`/tournaments/teams/${teamId}/`, data);
        return response.data;
    },

    addTeam: async (tournamentId, teamData) => {
        const response = await api.post(`/tournaments/tournaments/${tournamentId}/register_team/`, teamData);
        return response.data;
    },

    // Pool management
    generatePools: async (tournamentId, teamsPerPool = 4) => {
        const response = await api.post(`/tournaments/tournaments/${tournamentId}/generate_pools/`, {
            teams_per_pool: teamsPerPool
        });
        return response.data;
    },

    getPools: async (tournamentId) => {
        const response = await api.get(`/tournaments/tournaments/${tournamentId}/pools/`);
        return response.data;
    },

    scheduleMatches: async (tournamentId) => {
        const response = await api.post(`/tournaments/tournaments/${tournamentId}/schedule_matches/`);
        return response.data;
    },

    // Player management
    addPlayer: async (teamId, playerData) => {
        const response = await api.post(`/tournaments/teams/${teamId}/add_player/`, playerData);
        return response.data;
    },
};

