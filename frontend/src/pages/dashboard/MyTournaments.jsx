import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const MyTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchMyTournaments();
    }, []);

    const fetchMyTournaments = async () => {
        try {
            const response = await api.get('/tournaments/teams/');
            const userTournaments = response.data.results || response.data;
            setTournaments(userTournaments);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            setToast({ message: 'Failed to load your tournaments', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Filter and search logic
    const filteredTournaments = useMemo(() => {
        return tournaments.filter(team => {
            const matchesSearch = team.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.tournament?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' ||
                team.tournament?.status?.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [tournaments, searchTerm, statusFilter]);

    // Get unique statuses for filter
    const availableStatuses = useMemo(() => {
        const statuses = new Set(tournaments.map(t => t.tournament?.status?.toLowerCase()).filter(Boolean));
        return Array.from(statuses);
    }, [tournaments]);

    // Countdown timer component
    const CountdownTimer = ({ targetDate }) => {
        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(targetDate));
            }, 1000);
            return () => clearInterval(timer);
        }, [targetDate]);

        function calculateTimeLeft(target) {
            const difference = new Date(target) - new Date();
            if (difference <= 0) return null;

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }

        if (!timeLeft) return <span className="text-gray-500 text-sm">Started</span>;

        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    {timeLeft.days > 0 && (
                        <div className="bg-accent-red/10 text-accent-red px-2 py-1 rounded-lg text-center min-w-[40px]">
                            <span className="text-lg font-black">{timeLeft.days}</span>
                            <span className="text-xs block -mt-1">days</span>
                        </div>
                    )}
                    <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-center min-w-[40px]">
                        <span className="text-lg font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-xs block -mt-1">hrs</span>
                    </div>
                    <span className="text-gray-400 font-bold">:</span>
                    <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-center min-w-[40px]">
                        <span className="text-lg font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-xs block -mt-1">min</span>
                    </div>
                    {timeLeft.days === 0 && (
                        <>
                            <span className="text-gray-400 font-bold">:</span>
                            <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-center min-w-[40px] animate-pulse">
                                <span className="text-lg font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                                <span className="text-xs block -mt-1">sec</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'closed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'open':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'ongoing':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
            case 'completed':
                return (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (loading) return <PageSkeleton type="dashboard" />;

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">My Tournaments</h1>
                <p className="text-gray-600 mt-2">View and manage your tournament registrations</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search tournaments or teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all bg-white font-medium min-w-[160px]"
                >
                    <option value="all">All Status</option>
                    {availableStatuses.map(status => (
                        <option key={status} value={status} className="capitalize">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Results count */}
            {tournaments.length > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                    Showing {filteredTournaments.length} of {tournaments.length} tournaments
                </p>
            )}

            {tournaments.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                    {/* Illustrated empty state */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-accent-green/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Tournaments Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        You haven't registered for any tournaments yet. Join one now and start your journey to victory!
                    </p>
                    <Link
                        to="/tournaments"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Tournaments
                    </Link>
                </div>
            ) : filteredTournaments.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter</p>
                    <button
                        onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                        className="mt-4 text-accent-red font-medium hover:underline"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTournaments.map((team, index) => (
                        <div
                            key={team.id}
                            className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Card Header with Gradient */}
                            <div className="relative h-24 bg-gradient-to-br from-accent-red via-accent-black to-accent-green p-4">
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <h3 className="text-lg font-black text-white truncate pr-2">
                                        {team.tournament?.name || 'Tournament'}
                                    </h3>
                                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(team.tournament?.status)}`}>
                                        {getStatusIcon(team.tournament?.status)}
                                        {team.tournament?.status || 'N/A'}
                                    </span>
                                </div>
                                {/* Decorative circles */}
                                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-white/10 rounded-full"></div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white/10 rounded-full"></div>
                            </div>

                            <div className="p-6">
                                {/* Team Info */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-accent-green flex items-center justify-center text-white font-bold text-lg">
                                        {team.name?.charAt(0) || 'T'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Team: {team.name}</p>
                                        <p className="text-sm text-gray-500">{team.players?.length || 0} players registered</p>
                                    </div>
                                </div>

                                {/* Countdown Timer for Upcoming */}
                                {team.tournament?.start_date && team.tournament?.status?.toLowerCase() === 'open' && (
                                    <div className="mb-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Starts in</p>
                                        <CountdownTimer targetDate={team.tournament.start_date} />
                                    </div>
                                )}

                                {/* Tournament Details */}
                                <div className="space-y-3 mb-4">
                                    {team.tournament?.start_date && (
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm">{new Date(team.tournament.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    )}

                                    {team.tournament?.venue && (
                                        <div className="flex items-center text-gray-600">
                                            <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-sm truncate">{team.tournament.venue}</span>
                                        </div>
                                    )}
                                </div>

                                {/* View Details Button */}
                                <Link
                                    to={`/tournaments/${team.tournament?.id}`}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-gray-800 to-accent-black text-white rounded-xl font-bold hover:from-accent-red hover:to-red-700 transition-all duration-300 group-hover:shadow-lg"
                                >
                                    View Details
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTournaments;
