import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tournamentService } from '../../services/tournaments';
import PageSkeleton from '../../components/common/PageSkeleton';

const TournamentDetailsPage = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);  // Added teams state
    const [pools, setPools] = useState([]);
    const [matches, setMatches] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPools, setExpandedPools] = useState({});

    useEffect(() => {
        const fetchTournamentData = async () => {
            try {
                const [tournamentData, teamsData, poolsData, matchesData, standingsData] = await Promise.all([
                    tournamentService.getById(id),
                    tournamentService.getTeams(id).catch(() => []),  // Fetch teams
                    tournamentService.getPools(id).catch(() => []),
                    tournamentService.getMatches(id).catch(() => []),
                    tournamentService.getStandings(id).catch(() => [])
                ]);

                setTournament(tournamentData);
                setTeams(teamsData);  // Set teams data
                setPools(poolsData);
                setMatches(matchesData);
                setStandings(standingsData);

                // Initialize all pools as expanded
                const expanded = {};
                poolsData.forEach(pool => {
                    expanded[pool.id] = true;
                });
                setExpandedPools(expanded);
            } catch (err) {
                console.error('Error fetching tournament details:', err);
                setError('Failed to load tournament details');
            } finally {
                setLoading(false);
            }
        };

        fetchTournamentData();
    }, [id]);

    const togglePool = (poolId) => {
        setExpandedPools(prev => ({
            ...prev,
            [poolId]: !prev[poolId]
        }));
    };

    if (loading) return <PageSkeleton />;

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


                    {/* Registered Teams Section */}
                    {teams.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Teams</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map((team) => (
                                    <div key={team.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                {team.logo && (
                                                    <img
                                                        src={team.logo}
                                                        alt={team.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {team.player_count || 0} players
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                team.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {team.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pools and Standings Section */}
                    {pools.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pools & Groups</h2>
                            <div className="space-y-4">
                                {pools.map((pool) => (
                                    <div key={pool.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Pool Header */}
                                        <button
                                            onClick={() => togglePool(pool.id)}
                                            className="w-full bg-gradient-to-r from-blue-50 to-purple-50 p-4 flex justify-between items-center hover:from-blue-100 hover:to-purple-100 transition-all"
                                        >
                                            <h3 className="text-lg font-bold text-gray-900">{pool.name}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600">
                                                    {pool.teams?.length || 0} Teams
                                                </span>
                                                <svg
                                                    className={`w-5 h-5 transition-transform ${expandedPools[pool.id] ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </button>

                                        {/* Pool Content */}
                                        {expandedPools[pool.id] && (
                                            <div className="p-4 bg-white">
                                                {/* Teams in Pool */}
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-gray-700 mb-2">Teams</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {pool.teams?.map((team) => (
                                                            <div key={team.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                </svg>
                                                                <span className="font-medium text-gray-900">{team.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Pool Standings */}
                                                {pool.standings && pool.standings.length > 0 && (
                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-gray-700 mb-2">Standings</h4>
                                                        <div className="overflow-x-auto">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="text-left p-2 font-semibold text-gray-600">Pos</th>
                                                                        <th className="text-left p-2 font-semibold text-gray-600">Team</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">P</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">W</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">D</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">L</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">GF</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">GA</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">GD</th>
                                                                        <th className="text-center p-2 font-semibold text-gray-600">Pts</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200">
                                                                    {pool.standings.map((standing, idx) => (
                                                                        <tr key={standing.id} className="hover:bg-gray-50">
                                                                            <td className="p-2 font-medium text-gray-900">{idx + 1}</td>
                                                                            <td className="p-2 font-medium text-gray-900">{standing.team_details?.name}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.played}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.wins}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.draws}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.losses}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.goals_for}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.goals_against}</td>
                                                                            <td className="p-2 text-center text-gray-600">{standing.goal_difference}</td>
                                                                            <td className="p-2 text-center font-bold text-blue-600">{standing.points}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Pool Matches */}
                                                {pool.matches && pool.matches.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700 mb-2">Fixtures</h4>
                                                        <div className="space-y-2">
                                                            {pool.matches.map((match) => (
                                                                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex-1 text-right">
                                                                        <span className="font-medium text-gray-900">{match.team1_details?.name}</span>
                                                                    </div>
                                                                    <div className="px-4 text-center min-w-[60px]">
                                                                        {match.status === 'completed' ? (
                                                                            <span className="font-bold text-lg">
                                                                                {match.team1_score} - {match.team2_score}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-sm text-gray-500">vs</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <span className="font-medium text-gray-900">{match.team2_details?.name}</span>
                                                                    </div>
                                                                    <div className="ml-4 text-sm text-gray-500">
                                                                        {new Date(match.match_date).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                            <Link 
                                to={`/tournaments/${tournament.id}/register`}
                                className="w-full mt-6 btn-primary py-3 text-lg shadow-lg shadow-primary-500/30 flex justify-center text-center rounded-lg"
                            >
                                Register Team
                            </Link>
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

