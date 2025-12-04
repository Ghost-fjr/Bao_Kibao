import { useState, useEffect } from 'react';
import { tournamentService } from '../../services/tournaments';
import Toast from '../common/Toast';

const TeamManagementModal = ({ tournament, isOpen, onClose, onUpdate }) => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', captain: '' });

    useEffect(() => {
        if (isOpen && tournament) {
            fetchTeams();
        }
    }, [isOpen, tournament]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const data = await tournamentService.getTeams(tournament.id);
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setToast({ message: 'Failed to load teams', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (teamId) => {
        try {
            await tournamentService.approveTeam(teamId);
            setToast({ message: 'Team approved successfully', type: 'success' });
            fetchTeams();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error approving team:', error);
            setToast({ message: 'Failed to approve team', type: 'error' });
        }
    };

    const handleReject = async (teamId) => {
        try {
            await tournamentService.rejectTeam(teamId);
            setToast({ message: 'Team rejected', type: 'success' });
            fetchTeams();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error rejecting team:', error);
            setToast({ message: 'Failed to reject team', type: 'error' });
        }
    };

    const handleGeneratePools = async () => {
        try {
            const result = await tournamentService.generatePools(tournament.id, 4);
            setToast({ message: result.message, type: 'success' });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error generating pools:', error);
            setToast({ message: error.response?.data?.error || 'Failed to generate pools', type: 'error' });
        }
    };

    const handleScheduleMatches = async () => {
        try {
            const result = await tournamentService.scheduleMatches(tournament.id);
            setToast({ message: result.message, type: 'success' });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error scheduling matches:', error);
            setToast({ message: error.response?.data?.error || 'Failed to schedule matches', type: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!isOpen) return null;

    const approvedCount = teams.filter(t => t.status === 'approved').length;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent-black to-gray-800 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black">Manage Teams</h2>
                            <p className="text-gray-300 mt-1">{tournament?.name}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="text-2xl font-bold">{teams.length}</div>
                            <div className="text-sm text-gray-300">Total Teams</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="text-2xl font-bold">{approvedCount}</div>
                            <div className="text-sm text-gray-300">Approved</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                            <div className="text-2xl font-bold">{teams.filter(t => t.status === 'pending').length}</div>
                            <div className="text-sm text-gray-300">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={handleGeneratePools}
                            disabled={approvedCount < 2}
                            className="px-4 py-2 bg-accent-red text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            Generate Pools
                        </button>
                        <button
                            onClick={handleScheduleMatches}
                            className="px-4 py-2 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Schedule Matches
                        </button>
                    </div>
                    {approvedCount < 2 && (
                        <p className="text-sm text-gray-600 mt-2">
                            * Need at least 2 approved teams to generate pools
                        </p>
                    )}
                </div>

                {/* Teams List */}
                <div className="p-6 overflow-y-auto max-h-[500px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="relative w-16 h-16">
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-full h-full border-4 border-accent-red rounded-full animate-spin border-t-transparent"></div>
                            </div>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-600">No teams registered yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {teams.map((team) => (
                                <div key={team.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-bold text-accent-black">{team.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(team.status)}`}>
                                                    {team.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Captain:</span> {team.captain_details?.email || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Players:</span> {team.player_count || 0}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Registered:</span> {new Date(team.registered_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {team.status === 'pending' && (
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleApprove(team.id)}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(team.id)}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all text-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeamManagementModal;
