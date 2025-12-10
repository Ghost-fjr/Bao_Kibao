import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../services/api';

const Overview = () => {
    const { user } = useOutletContext();
    const [stats, setStats] = useState({
        orders: 0,
        tournaments: 0,
        spent: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    // Get motivational message
    const getMotivationalMessage = () => {
        const messages = [
            "Ready to make a difference today?",
            "Every step counts towards victory!",
            "Champions are made, not born.",
            "Your journey continues here.",
            "Excellence awaits you."
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, tournamentsRes] = await Promise.all([
                    api.get('/store/orders/'),
                    api.get('/tournaments/teams/')
                ]);

                const orders = ordersRes.data.results || ordersRes.data || [];
                const teams = tournamentsRes.data.results || tournamentsRes.data || [];

                // Calculate total spent
                const totalSpent = Array.isArray(orders)
                    ? orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0)
                    : 0;

                setStats({
                    orders: orders.length || 0,
                    tournaments: teams.length || 0,
                    spent: totalSpent
                });

                // Create recent activity from orders and tournament registrations
                const activities = [];

                if (Array.isArray(orders)) {
                    orders.slice(0, 3).forEach(order => {
                        activities.push({
                            id: `order-${order.id}`,
                            type: 'order',
                            title: `Order #${order.id}`,
                            description: `Placed an order for Ksh ${order.total_amount || 0}`,
                            date: order.created_at,
                            status: order.status,
                            icon: 'shopping'
                        });
                    });
                }

                if (Array.isArray(teams)) {
                    teams.slice(0, 3).forEach(team => {
                        activities.push({
                            id: `team-${team.id}`,
                            type: 'tournament',
                            title: team.tournament?.name || 'Tournament',
                            description: `Registered team: ${team.name}`,
                            date: team.created_at,
                            status: team.tournament?.status,
                            icon: 'trophy'
                        });
                    });
                }

                // Sort by date and take latest 5
                activities.sort((a, b) => new Date(b.date) - new Date(a.date));
                setRecentActivity(activities.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    // Animated counter hook
    const AnimatedCounter = ({ value, duration = 1000 }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            if (value === 0) return;

            const steps = 20;
            const increment = value / steps;
            const stepTime = duration / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, stepTime);

            return () => clearInterval(timer);
        }, [value, duration]);

        return <span>{count}</span>;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-32 bg-gray-200 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-gray-200 rounded-2xl"></div>
                    <div className="h-32 bg-gray-200 rounded-2xl"></div>
                    <div className="h-32 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-accent-red via-accent-black to-accent-green rounded-3xl p-8 text-white shadow-2xl">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10">
                    <p className="text-sm font-medium opacity-80 mb-1">{getGreeting()},</p>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                        {user?.first_name || user?.username || 'Champion'}!
                    </h2>
                    <p className="text-white/70 text-sm md:text-base">{getMotivationalMessage()}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tournaments Card */}
                <Link
                    to="/dashboard/my-tournaments"
                    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-50 rounded-full"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">My Tournaments</p>
                            <p className="text-4xl font-black text-accent-black">
                                <AnimatedCounter value={stats.tournaments} />
                            </p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                {stats.tournaments === 0 ? 'Join your first tournament!' : 'Active registrations'}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-accent-red to-red-700 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-5 h-5 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </Link>

                {/* Orders Card */}
                <Link
                    to="/dashboard/my-orders"
                    className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">My Orders</p>
                            <p className="text-4xl font-black text-accent-black">
                                <AnimatedCounter value={stats.orders} />
                            </p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                {stats.orders === 0 ? 'Start shopping!' : 'Total orders placed'}
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-accent-green to-green-700 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </Link>

                {/* Total Spent Card */}
                <div className="group relative overflow-hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-100 rounded-full"></div>

                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Spent</p>
                            <p className="text-4xl font-black text-accent-black">
                                Ksh <AnimatedCounter value={Math.round(stats.spent)} />
                            </p>
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                Supporting the cause
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-gray-800 to-accent-black rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-accent-black">Recent Activity</h3>
                        {recentActivity.length > 0 && (
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {recentActivity.length} activities
                            </span>
                        )}
                    </div>

                    {recentActivity.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">No recent activity yet</p>
                            <p className="text-gray-400 text-xs mt-1">Start exploring tournaments and the store!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${activity.type === 'order'
                                            ? 'bg-green-100 text-accent-green'
                                            : 'bg-red-100 text-accent-red'
                                        }`}>
                                        {activity.icon === 'shopping' ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{activity.title}</p>
                                        <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        {formatTimeAgo(activity.date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                    <h3 className="text-xl font-black text-accent-black mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Link
                            to="/tournaments"
                            className="group relative overflow-hidden p-6 border-2 border-gray-100 rounded-2xl hover:border-accent-red transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 bg-red-100 rounded-xl text-accent-red mr-4 group-hover:scale-110 group-hover:bg-accent-red group-hover:text-white transition-all duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-accent-red transition-colors">Browse Tournaments</h4>
                                    <p className="text-sm text-gray-500">Find and register for upcoming events</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-red group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        <Link
                            to="/store"
                            className="group relative overflow-hidden p-6 border-2 border-gray-100 rounded-2xl hover:border-accent-green transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 bg-green-100 rounded-xl text-accent-green mr-4 group-hover:scale-110 group-hover:bg-accent-green group-hover:text-white transition-all duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-accent-green transition-colors">Visit Store</h4>
                                    <p className="text-sm text-gray-500">Shop merchandise and support the cause</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-green group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>

                        <Link
                            to="/dashboard/profile"
                            className="group relative overflow-hidden p-6 border-2 border-gray-100 rounded-2xl hover:border-accent-black transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center">
                                <div className="p-3 bg-gray-100 rounded-xl text-gray-700 mr-4 group-hover:scale-110 group-hover:bg-accent-black group-hover:text-white transition-all duration-300">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-accent-black transition-colors">Update Profile</h4>
                                    <p className="text-sm text-gray-500">Complete your account information</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-black group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
