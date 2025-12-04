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
            <h2 className="text-3xl font-black text-accent-black mb-8 tracking-tight">Welcome back, {user?.first_name || user?.username}!</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-8 border-accent-red hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">My Tournaments</p>
                            <p className="text-4xl font-black text-accent-black mt-2">{stats.tournaments}</p>
                            {stats.tournaments === 0 && (
                                <p className="text-xs text-gray-400 mt-2 font-medium">No tournaments yet</p>
                            )}
                        </div>
                        <div className="p-4 bg-red-50 rounded-2xl text-accent-red shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-8 border-accent-green hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">My Orders</p>
                            <p className="text-4xl font-black text-accent-black mt-2">{stats.orders}</p>
                            {stats.orders === 0 && (
                                <p className="text-xs text-gray-400 mt-2 font-medium">No orders yet</p>
                            )}
                        </div>
                        <div className="p-4 bg-green-50 rounded-2xl text-accent-green shadow-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-8 border-accent-black hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Profile Status</p>
                            <p className="text-xl font-black text-accent-black mt-2">
                                {user?.is_verified ? 'Verified' : 'Not Verified'}
                            </p>
                            {!user?.is_verified && (
                                <p className="text-xs text-gray-400 mt-2 font-medium">Complete your profile</p>
                            )}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm ${user?.is_verified ? 'bg-green-50 text-accent-green' : 'bg-gray-100 text-gray-500'}`}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-xl font-black text-accent-black mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="/tournaments" className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-accent-red hover:bg-red-50/50 transition-all duration-300">
                        <div className="flex items-center mb-3">
                            <div className="p-2 bg-red-100 rounded-lg text-accent-red mr-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-accent-red transition-colors">Browse Tournaments</h4>
                        </div>
                        <p className="text-sm text-gray-500 pl-14">Find and register for upcoming tournaments in your area.</p>
                    </a>
                    <a href="/store" className="group p-6 border-2 border-gray-100 rounded-2xl hover:border-accent-green hover:bg-green-50/50 transition-all duration-300">
                        <div className="flex items-center mb-3">
                            <div className="p-2 bg-green-100 rounded-lg text-accent-green mr-3 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-accent-green transition-colors">Visit Store</h4>
                        </div>
                        <p className="text-sm text-gray-500 pl-14">Shop for merchandise and equipment to support the cause.</p>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Overview;

