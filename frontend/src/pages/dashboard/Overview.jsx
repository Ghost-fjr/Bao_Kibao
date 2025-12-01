import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';

const Overview = () => {
    const { user } = useOutletContext();
    const [stats, setStats] = useState({
        orders: 0,
        tournaments: 0,
        spent: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersRes, tournamentsRes] = await Promise.all([
                    api.get('/store/orders/'),
                    api.get('/tournaments/teams/')
                ]);

                setStats({
                    orders: ordersRes.data.count || ordersRes.data.length || 0,
                    tournaments: tournamentsRes.data.count || tournamentsRes.data.length || 0,
                    spent: 0
                });
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

    if (loading) return <div>Loading stats...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Welcome back, {user?.first_name || user?.username}!</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Tournaments</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tournaments}</p>
                            {stats.tournaments === 0 && (
                                <p className="text-xs text-gray-400 mt-1">No tournaments yet</p>
                            )}
                        </div>
                        <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.orders}</p>
                            {stats.orders === 0 && (
                                <p className="text-xs text-gray-400 mt-1">No orders yet</p>
                            )}
                        </div>
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Profile Status</p>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                                {user?.is_verified ? 'Verified' : 'Not Verified'}
                            </p>
                            {!user?.is_verified && (
                                <p className="text-xs text-gray-400 mt-1">Complete your profile</p>
                            )}
                        </div>
                        <div className={`p-3 rounded-full ${user?.is_verified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href="/tournaments" className="p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <h4 className="font-medium text-gray-900">Browse Tournaments</h4>
                        <p className="text-sm text-gray-500 mt-1">Find and register for upcoming tournaments</p>
                    </a>
                    <a href="/store" className="p-4 border rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <h4 className="font-medium text-gray-900">Visit Store</h4>
                        <p className="text-sm text-gray-500 mt-1">Shop for merchandise and equipment</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Overview;

