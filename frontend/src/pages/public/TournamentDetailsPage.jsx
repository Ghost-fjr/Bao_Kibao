import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments';

const TournamentDetailsPage = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const data = await tournamentService.getById(id);
                setTournament(data);
            } catch (err) {
                console.error('Error fetching tournament details:', err);
                setError('Failed to load tournament details');
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
                    <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h2 className="text-2xl font-bold text-red-600">{error || 'Tournament not found'}</h2>
                <Link to="/tournaments" className="mt-4 inline-block btn-primary">
                    Back to Tournaments
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Hero Section */}
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700">
                    {tournament.banner_image && (
                        <img
                            src={tournament.banner_image}
                            alt={tournament.name}
                            className="w-full h-full object-cover mix-blend-overlay"
                        />
                    )}
                </div>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium uppercase tracking-wider">
                            {tournament.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider ${tournament.status === 'open' ? 'bg-green-500' : 'bg-gray-500'
                            }`}>
                            {tournament.status}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{tournament.name}</h1>
                    <p className="text-lg text-blue-100 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {tournament.venue}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Tournament</h2>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {tournament.description}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-medium">Registration Deadline</span>
                                <span className="text-gray-900 font-bold">
                                    {new Date(tournament.registration_deadline).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-medium">Tournament Starts</span>
                                <span className="text-gray-900 font-bold">
                                    {new Date(tournament.start_date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-medium">Tournament Ends</span>
                                <span className="text-gray-900 font-bold">
                                    {new Date(tournament.end_date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Tournament Info</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Entry Fee</span>
                                <span className="text-xl font-bold text-primary-600">
                                    Ksh {parseFloat(tournament.registration_fee).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Prize Pool</span>
                                <span className="font-semibold text-gray-900">
                                    Ksh {parseFloat(tournament.prize_pool || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Max Teams</span>
                                <span className="font-semibold text-gray-900">{tournament.max_teams}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Registered</span>
                                <span className="font-semibold text-gray-900">{tournament.registered_teams_count || 0}</span>
                            </div>
                        </div>

                        {tournament.status === 'open' && (
                            <button className="w-full mt-6 btn-primary py-3 text-lg shadow-lg shadow-primary-500/30">
                                Register Team
                            </button>
                        )}
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Need Help?</h3>
                        <p className="text-blue-700 text-sm mb-4">
                            Contact the tournament organizers for any questions regarding registration or rules.
                        </p>
                        <Link to="/contact" className="text-blue-600 font-medium hover:text-blue-800 text-sm">
                            Contact Support &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentDetailsPage;

