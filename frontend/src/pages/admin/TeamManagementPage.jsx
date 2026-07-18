import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments';
import Toast from '../../components/common/Toast';

const TeamManagementPage = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (id) {
            fetchTournamentAndTeams(currentPage);
        }
    }, [id, currentPage]);

    const fetchTournamentAndTeams = async (page) => {
        setLoading(true);
        try {
            // We could fetch tournament details separately if needed, but let's assume we fetch teams first
            const tournamentData = await tournamentService.getById(id);
            setTournament(tournamentData);

            const data = await tournamentService.getTeams(id, page);
            if (data.results) {
                setTeams(data.results);
                setTotalCount(data.count);
                // DRF page size is typically 10, calculate total pages
                setTotalPages(Math.ceil(data.count / 10)); // Assuming PAGE_SIZE = 10
            } else {
                setTeams(data);
                setTotalCount(data.length);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setToast({ message: 'Failed to load teams', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (teamId) => {
        try {
            await tournamentService.approveTeam(teamId);
            setToast({ message: 'Team approved successfully', type: 'success' });
            fetchTournamentAndTeams(currentPage);
        } catch (error) {
            console.error('Error approving team:', error);
            setToast({ message: 'Failed to approve team', type: 'error' });
        }
    };

    const handleReject = async (teamId) => {
        try {
            await tournamentService.rejectTeam(teamId);
            setToast({ message: 'Team rejected', type: 'success' });
            fetchTournamentAndTeams(currentPage);
        } catch (error) {
            console.error('Error rejecting team:', error);
            setToast({ message: 'Failed to reject team', type: 'error' });
        }
    };

    const handleGeneratePools = async () => {
        try {
            const result = await tournamentService.generatePools(id, 4);
            setToast({ message: result.message, type: 'success' });
            fetchTournamentAndTeams(currentPage);
        } catch (error) {
            console.error('Error generating pools:', error);
            setToast({ message: error.response?.data?.error || 'Failed to generate pools', type: 'error' });
        }
    };

    const handleScheduleMatches = async () => {
        try {
            const result = await tournamentService.scheduleMatches(id);
            setToast({ message: result.message, type: 'success' });
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

    const approvedCount = tournament?.approved_teams_count || 0;
    
    // Total pending could be derived from backend stats if available, but let's just use what's on page or totalCount
    const pendingCount = totalCount - approvedCount; // Approximation if only approved and pending exist

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex items-center gap-4 mb-6">
                <Link to="/dashboard/admin/tournaments" className="text-gray-500 hover:text-accent-red transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-accent-black tracking-tight">Manage Teams</h1>
                    <p className="text-gray-600 mt-1">{tournament?.name || 'Loading...'}</p>
                </div>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total Teams</p>
                        <h3 className="text-3xl font-black text-accent-black">{totalCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Approved</p>
                        <h3 className="text-3xl font-black text-green-600">{approvedCount}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Max Teams</p>
                        <h3 className="text-3xl font-black text-accent-red">{tournament?.max_teams || '-'}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-accent-red">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={handleGeneratePools}
                        disabled={approvedCount < 2}
                        className="px-6 py-3 bg-accent-red text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Generate Pools
                    </button>
                    <button
                        onClick={handleScheduleMatches}
                        className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Schedule Matches
                    </button>
                </div>
                {approvedCount < 2 && (
                    <p className="text-sm text-gray-500 mt-3 font-medium">
                        * Need at least 2 approved teams to generate pools
                    </p>
                )}
            </div>

            {/* Teams List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-accent-black">Registered Teams</h2>
                </div>
                
                <div className="p-6">
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
                            <p className="text-gray-600 font-medium">No teams found on this page</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {teams.map((team) => (
                                <div key={team.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-accent-black">{team.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(team.status)}`}>
                                                {team.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                            <p><span className="font-medium text-gray-700">Captain:</span> {team.captain_details?.email || 'N/A'}</p>
                                            <p><span className="font-medium text-gray-700">Players:</span> {team.player_count || team.players?.length || 0}</p>
                                            <p><span className="font-medium text-gray-700">Registered:</span> {new Date(team.registered_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {team.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(team.id)}
                                                className="px-6 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all shadow-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(team.id)}
                                                className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all shadow-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {!loading && totalPages > 1 && (
                        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                            <div className="text-sm text-gray-600 font-medium">
                                Showing page <span className="font-bold text-gray-900">{currentPage}</span> of <span className="font-bold text-gray-900">{totalPages}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamManagementPage;
