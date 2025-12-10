import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
                // Simulate some notifications (in real app, fetch from API)
                setNotificationCount(Math.floor(Math.random() * 5));
            } catch (err) {
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    // Redirect admin users from /dashboard to first management page
    useEffect(() => {
        if (!loading && user) {
            const isAdmin = user?.is_staff || user?.role === 'admin';
            if (isAdmin && location.pathname === '/dashboard') {
                navigate('/dashboard/admin/tournaments');
            }
        }
    }, [user, loading, location.pathname, navigate]);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    // Get page title from current route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/dashboard') return 'Overview';
        if (path.includes('my-tournaments')) return 'My Tournaments';
        if (path.includes('my-orders')) return 'My Orders';
        if (path.includes('profile')) return 'Profile';
        if (path.includes('admin/tournaments')) return 'Tournament Management';
        if (path.includes('admin/store')) return 'Store Management';
        if (path.includes('admin/categories')) return 'Categories';
        if (path.includes('admin/orders')) return 'Orders';
        if (path.includes('admin/payments')) return 'Payments';
        if (path.includes('admin/payment-links')) return 'Payment Links';
        if (path.includes('admin/cms')) return 'Content Management';
        if (path.includes('admin/users')) return 'User Management';
        return 'Dashboard';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-accent-red rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-500 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const isAdmin = user?.is_staff || user?.role === 'admin';

    // User navigation items
    const userNavigation = [
        { name: 'Overview', href: '/dashboard', icon: 'HomeIcon' },
        { name: 'My Tournaments', href: '/dashboard/my-tournaments', icon: 'TrophyIcon' },
        { name: 'My Orders', href: '/dashboard/my-orders', icon: 'ShoppingBagIcon' },
        { name: 'Profile', href: '/dashboard/profile', icon: 'UserIcon' },
    ];

    // Admin navigation items - Management only (like Django Admin)
    const adminNavigation = [
        { name: 'Tournaments', href: '/dashboard/admin/tournaments', icon: 'TrophyIcon' },
        { name: 'Store', href: '/dashboard/admin/store', icon: 'ShoppingCartIcon' },
        { name: 'Categories', href: '/dashboard/admin/categories', icon: 'TagIcon' },
        { name: 'Orders', href: '/dashboard/admin/orders', icon: 'ClipboardListIcon' },
        { name: 'Payments', href: '/dashboard/admin/payments', icon: 'CreditCardIcon' },
        { name: 'Payment Links', href: '/dashboard/admin/payment-links', icon: 'LinkIcon' },
        { name: 'Content', href: '/dashboard/admin/cms', icon: 'DocumentTextIcon' },
        { name: 'Gallery', href: '/dashboard/admin/gallery', icon: 'PhotographIcon' },
        { name: 'Users', href: '/dashboard/admin/users', icon: 'UsersIcon' },
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
            LinkIcon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
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
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-accent-black/95 backdrop-blur-xl text-white flex flex-col transform transition-all duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className="p-6 flex justify-between items-center border-b border-white/10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-red to-accent-green flex items-center justify-center text-lg font-black shadow-lg group-hover:scale-110 transition-transform">
                            B
                        </div>
                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-accent-red via-white to-accent-green tracking-tighter">
                            Bao Kibao
                        </span>
                    </Link>
                    <button
                        className="md:hidden text-white/70 hover:text-white transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {navigation.map((item, index) => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`group flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive(item.href)
                                ? 'bg-gradient-to-r from-accent-red to-red-700 text-white shadow-lg shadow-accent-red/30'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <span className={`mr-3 transition-transform duration-300 ${isActive(item.href) ? 'scale-110' : 'group-hover:scale-110'}`}>
                                {renderIcon(item.icon)}
                            </span>
                            <span className="text-sm font-semibold">{item.name}</span>
                            {isActive(item.href) && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
                    <div className="flex items-center mb-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent-red to-accent-green flex items-center justify-center text-lg font-black shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                            {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.first_name || user?.username || user?.email}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                {isAdmin ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-red"></span>
                                        Admin
                                    </>
                                ) : (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent-green"></span>
                                        Member
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-xl shadow-sm text-sm font-semibold text-white bg-red-600/80 hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/30 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-xl shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-100 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            className="text-gray-500 hover:text-accent-red transition-colors md:hidden p-2 hover:bg-gray-100 rounded-xl"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Page Title */}
                        <div className="hidden md:flex items-center gap-2 text-gray-500">
                            <Link to="/dashboard" className="hover:text-accent-red transition-colors">Dashboard</Link>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="text-accent-black font-bold">{getPageTitle()}</span>
                        </div>
                        <h1 className="md:hidden text-xl font-black text-accent-black">{getPageTitle()}</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Notification Bell */}
                        <button className="relative p-2 text-gray-500 hover:text-accent-red hover:bg-gray-100 rounded-xl transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-red text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                                    {notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Admin Badge */}
                        {isAdmin && (
                            <span className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-accent-red/10 to-accent-green/10 text-accent-black rounded-full text-sm font-semibold border border-gray-200">
                                <svg className="w-4 h-4 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Admin
                            </span>
                        )}

                        {/* Quick Profile Link */}
                        <Link
                            to="/dashboard/profile"
                            className="hidden md:flex items-center gap-2 p-1.5 pr-4 bg-gray-100 hover:bg-gray-200 rounded-full transition-all"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-red to-accent-green flex items-center justify-center text-white font-bold text-sm">
                                {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user?.first_name || user?.username}</span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/60 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
