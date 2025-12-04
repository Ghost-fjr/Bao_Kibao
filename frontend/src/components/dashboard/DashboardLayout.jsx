import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } catch (err) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const isAdmin = user?.is_staff || user?.role === 'admin';

    // User navigation items
    const userNavigation = [
        { name: 'Overview', href: '/dashboard', icon: 'HomeIcon' },
        { name: 'My Tournaments', href: '/dashboard/my-tournaments', icon: 'TrophyIcon' },
        { name: 'My Orders', href: '/dashboard/my-orders', icon: 'ShoppingBagIcon' },
        { name: 'Profile', href: '/dashboard/profile', icon: 'UserIcon' },
    ];

    // Admin navigation items
    const adminNavigation = [
        { name: 'Overview', href: '/dashboard', icon: 'HomeIcon' },
        { name: 'Manage Tournaments', href: '/dashboard/admin/tournaments', icon: 'TrophyIcon' },
        { name: 'Manage Store', href: '/dashboard/admin/store', icon: 'ShoppingCartIcon' },
        { name: 'Manage Categories', href: '/dashboard/admin/categories', icon: 'TagIcon' },
        { name: 'Manage CMS', href: '/dashboard/admin/cms', icon: 'DocumentTextIcon' },
        { name: 'Profile', href: '/dashboard/profile', icon: 'UserIcon' },
    ];

    const navigation = isAdmin ? adminNavigation : userNavigation;

    const isActive = (href) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className="flex h-screen bg-gray-100 relative overflow-hidden">
            {/* Background Blobs for Dashboard */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-accent-red/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-black/5 rounded-full blur-3xl"></div>
            </div>

            {/* Sidebar */}
            <div className="w-64 bg-accent-black text-white hidden md:flex flex-col relative z-10 shadow-2xl">
                <div className="p-6">
                    <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent-red via-white to-accent-green tracking-tighter">
                        Bao Kibao
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.href)
                                ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30 translate-x-1'
                                : 'text-gray-400 hover:bg-accent-green/10 hover:text-accent-green hover:translate-x-1'
                                }`}
                        >
                            <span className="mr-3">
                                {item.icon === 'HomeIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                )}
                                {item.icon === 'TrophyIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                )}
                                {item.icon === 'ShoppingBagIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                )}
                                {item.icon === 'ShoppingCartIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                )}
                                {item.icon === 'UserIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                )}
                                {item.icon === 'TagIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                )}
                                {item.icon === 'DocumentTextIcon' && (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                )}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800/50">
                    <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-red to-accent-black flex items-center justify-center text-sm font-bold shadow-lg border border-white/10">
                            {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-bold text-white">{user?.username || user?.email}</p>
                            <p className="text-xs text-gray-400 capitalize">{isAdmin ? 'Admin' : 'User'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-white/10 rounded-xl shadow-sm text-sm font-medium text-white bg-red-600/80 hover:bg-red-700 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-6 md:hidden border-b border-gray-100">
                    <span className="text-xl font-black text-accent-black">Dashboard</span>
                    <button className="text-gray-500 hover:text-accent-red transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/70 p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
