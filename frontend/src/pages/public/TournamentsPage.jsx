import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments.js';

const TournamentsPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const data = await tournamentService.getAll();
                if (data && Array.isArray(data.results)) {
                    setTournaments(data.results);
                } else if (Array.isArray(data)) {
                    setTournaments(data);
                } else {
                    setTournaments([]);
                }
            } catch (err) {
                console.error('Error fetching tournaments:', err);
                setError('Failed to load tournaments');
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/70 overflow-hidden font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-red/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-green/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-black/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                {/* Palestinian Doodles */}
                {/* Hearts */}
                <svg className="absolute top-20 right-16 w-16 h-16 text-accent-red opacity-30 animate-bounce" style={{ animationDuration: '2.5s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <svg className="absolute bottom-32 left-20 w-18 h-18 text-accent-green opacity-25 animate-bounce" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>

                {/* Palestinian Flags */}
                <svg className="absolute top-1/3 left-12 w-24 h-24 text-accent-red opacity-20" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="currentColor" />
                    <rect x="0" y="40" width="100" height="20" fill="#00843D" />
                    <polygon points="0,0 0,60 40,30" fill="currentColor" opacity="0.8" />
                </svg>
                <svg className="absolute bottom-1/4 right-24 w-20 h-20 text-accent-green opacity-20 animate-pulse" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="#E31E24" />
                    <rect x="0" y="40" width="100" height="20" fill="currentColor" />
                    <polygon points="0,0 0,60 40,30" fill="#E31E24" opacity="0.8" />
                </svg>

                {/* Stars */}
                <svg className="absolute top-40 right-32 w-14 h-14 text-accent-red opacity-20 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <svg className="absolute bottom-40 left-1/3 w-12 h-12 text-accent-green opacity-15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>

                {/* Palestinian Watermelon */}
                <svg className="absolute top-1/2 right-12 w-20 h-20 text-accent-red opacity-20" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="#00843D" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="currentColor" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="35" cy="45" r="2" fill="#000000" />
                    <circle cx="50" cy="50" r="2" fill="#000000" />
                    <circle cx="65" cy="45" r="2" fill="#000000" />
                </svg>
                <svg className="absolute bottom-1/3 left-16 w-18 h-18 text-accent-green opacity-25" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="currentColor" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="#E31E24" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="40" cy="45" r="1.5" fill="#000000" />
                    <circle cx="55" cy="48" r="1.5" fill="#000000" />
                </svg>

                {/* Palestine Map Outlines */}
                <svg className="absolute top-2/3 left-24 w-22 h-26 text-accent-black opacity-15" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <svg className="absolute top-1/4 right-1/3 w-20 h-24 text-accent-green opacity-20" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="currentColor" opacity="0.3" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-accent-red text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Compete for a Cause
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Tournaments</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                        Join our 7-a-side tournaments. Play the beautiful game, support Gaza, and be part of the movement.
                    </p>
                </div>

                {error ? (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-red-100 shadow-xl">
                        <h2 className="text-2xl font-bold text-accent-red mb-4">{error}</h2>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-accent-red text-white rounded-full hover:bg-red-700 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : tournaments.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Tournaments Scheduled</h3>
                        <p className="text-gray-500 mb-8">Check back soon for upcoming competitions!</p>
                        <Link to="/" className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg">
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tournaments.map((tournament) => (
                            <div key={tournament.id} className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100">
                                <div className="h-56 bg-gray-200 relative overflow-hidden">
                                    {tournament.banner_image ? (
                                        <>
                                            <img
                                                src={tournament.banner_image}
                                                alt={tournament.name}
                                                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent-red/80 to-primary-900/80 mix-blend-multiply z-10"></div>
                                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] z-0"></div>
                                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                                <span className="text-white text-6xl font-black opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                                                    {tournament.name ? tournament.name.charAt(0) : 'T'}
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    <div className="absolute top-4 right-4 z-30">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${tournament.status === 'Open' ? 'bg-green-400 text-green-900' : 'bg-gray-100 text-gray-600'}`}>
                                            {tournament.status || 'Open'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-accent-red transition-colors">{tournament.name || 'Unnamed Tournament'}</h3>
                                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{tournament.description || 'No description available'}</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center text-gray-600">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3 text-accent-red">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">{tournament.start_date ? new Date(tournament.start_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mr-3 text-accent-green">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium">{tournament.max_teams || 0} Teams Max</span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/tournaments/${tournament.id}`}
                                        className="block w-full py-4 text-center rounded-xl bg-gray-900 text-white font-bold hover:bg-accent-red transition-colors shadow-lg"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TournamentsPage;
