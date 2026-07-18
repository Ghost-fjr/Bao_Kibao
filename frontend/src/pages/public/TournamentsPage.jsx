import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments.js';
import BackgroundElements from '../../components/common/BackgroundElements';
import PageSkeleton from '../../components/common/PageSkeleton';

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

    if (loading) return <PageSkeleton type="grid" />;

    return (
        <div className="bg-gradient-to-b from-accent-black/70 via-accent-red/60 to-accent-green/70 relative overflow-hidden min-h-screen font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <BackgroundElements />

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
        </div >
    );
};

export default TournamentsPage;
