import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

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

    // Admin navigation items - Full Django Admin functionality
    const adminNavigation = [
        { name: 'Overview', href: '/dashboard', icon: 'HomeIcon' },
        { name: 'Tournaments', href: '/dashboard/admin/tournaments', icon: 'TrophyIcon' },
        { name: 'Store', href: '/dashboard/admin/store', icon: 'ShoppingCartIcon' },
        { name: 'Categories', href: '/dashboard/admin/categories', icon: 'TagIcon' },
        { name: 'Orders', href: '/dashboard/admin/orders', icon: 'ClipboardListIcon' },
        { name: 'Payments', href: '/dashboard/admin/payments', icon: 'CreditCardIcon' },
        { name: 'Content', href: '/dashboard/admin/cms', icon: 'DocumentTextIcon' },
        { name: 'Users', href: '/dashboard/admin/users', icon: 'UsersIcon' },
        { name: 'Profile', href: '/dashboard/profile', icon: 'UserIcon' },
    ];

    const navigation = isAdmin ? adminNavigation : userNavigation;

    const isActive = (href) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    // Icon renderer
    const renderIcon = (iconName) => {
        const icons = {
            HomeIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            TrophyIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
            ShoppingBagIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
            ShoppingCartIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
            UserIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
            TagIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
            DocumentTextIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            ClipboardListIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
            CreditCardIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
            PhotographIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
            UsersIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        };
        return icons[iconName] || icons.HomeIcon;
    };

    return (
        <div className="flex h-screen bg-gray-100 relative overflow-hidden">
            {/* Background Blobs for Dashboard */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-accent-red/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-accent-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-black/5 rounded-full blur-3xl"></div>
            </div>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-accent-black text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent-red via-white to-accent-green tracking-tighter">
                        Bao Kibao
                    </Link>
                    <button
                        className="md:hidden text-white"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.href)
                                ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30 translate-x-1'
                                : 'text-gray-400 hover:bg-accent-green/10 hover:text-accent-green hover:translate-x-1'
                                }`}
                        >
                            <span className="mr-3">{renderIcon(item.icon)}</span>
                            <span className="text-sm font-medium">{item.name}</span>
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
                <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-100">
                    <button
                        className="text-gray-500 hover:text-accent-red transition-colors md:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="text-xl font-black text-accent-black">Dashboard</span>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-gray-500">{isAdmin ? '🔐 Admin Access' : ''}</span>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/70 p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
