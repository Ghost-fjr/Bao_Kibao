import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [toast, setToast] = useState(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [stats, setStats] = useState({ orders: 0, tournaments: 0 });

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/profile/');
            setUser(response.data);
            setFormData({
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                email: response.data.email || '',
                phone: response.data.phone || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setToast({ message: 'Failed to load profile', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [ordersRes, tournamentsRes] = await Promise.all([
                api.get('/store/orders/'),
                api.get('/tournaments/teams/')
            ]);
            setStats({
                orders: ordersRes.data.results?.length || ordersRes.data.length || 0,
                tournaments: tournamentsRes.data.results?.length || tournamentsRes.data.length || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Calculate profile completion
    const profileCompletion = useMemo(() => {
        if (!user) return 0;
        const fields = ['first_name', 'last_name', 'email', 'phone'];
        const filledFields = fields.filter(field => user[field] && user[field].trim() !== '');
        return Math.round((filledFields.length / fields.length) * 100);
    }, [user]);

    // Calculate member duration
    const memberDuration = useMemo(() => {
        if (!user?.date_joined) return 'New member';
        const joined = new Date(user.date_joined);
        const now = new Date();
        const diffDays = Math.floor((now - joined) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await api.patch('/auth/profile/', formData);
            setUser(response.data);
            setEditing(false);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setToast({ message: 'Failed to update profile', type: 'error' });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            setToast({ message: 'Passwords do not match', type: 'error' });
            return;
        }

        try {
            await api.post('/auth/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
            });
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setChangingPassword(false);
            setToast({ message: 'Password changed successfully!', type: 'success' });
        } catch (error) {
            console.error('Error changing password:', error);
            setToast({ message: error.response?.data?.detail || 'Failed to change password', type: 'error' });
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
        }
        return user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';
    };

    if (loading) return <PageSkeleton type="dashboard" />;

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">Profile Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
            </div>

            {/* Profile Hero Section */}
            <div className="bg-gradient-to-r from-accent-red via-accent-black to-accent-green rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-black border-4 border-white/30 shadow-2xl">
                            {getInitials()}
                        </div>
                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-white text-accent-black rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl md:text-3xl font-black">
                            {user?.first_name && user?.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user?.username || 'Welcome!'}
                        </h2>
                        <p className="text-white/70 mt-1">{user?.email}</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                {user?.is_staff ? '🔐 Admin' : '👤 User'}
                            </span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                📅 Member for {memberDuration}
                            </span>
                        </div>
                    </div>

                    {/* Profile Completion Ring */}
                    <div className="text-center">
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 transform -rotate-90">
                                <circle
                                    className="text-white/20"
                                    strokeWidth="6"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="48"
                                    cy="48"
                                />
                                <circle
                                    className="text-white"
                                    strokeWidth="6"
                                    strokeDasharray={264}
                                    strokeDashoffset={264 - (264 * profileCompletion) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="42"
                                    cx="48"
                                    cy="48"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-black">{profileCompletion}%</span>
                            </div>
                        </div>
                        <p className="text-sm text-white/70 mt-2">Profile Complete</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Info Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-accent-black">Personal Information</h2>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-accent-black text-white rounded-xl font-bold hover:from-accent-red hover:to-red-700 transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all placeholder-transparent"
                                        placeholder="First Name"
                                    />
                                    <label
                                        htmlFor="first_name"
                                        className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-accent-red"
                                    >
                                        First Name
                                    </label>
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all placeholder-transparent"
                                        placeholder="Last Name"
                                    />
                                    <label
                                        htmlFor="last_name"
                                        className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-accent-red"
                                    >
                                        Last Name
                                    </label>
                                </div>
                            </div>

                            <div className="relative">
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all placeholder-transparent"
                                    placeholder="Email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-accent-red"
                                >
                                    Email Address
                                </label>
                            </div>

                            <div className="relative">
                                <input
                                    type="tel"
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="peer w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all placeholder-transparent"
                                    placeholder="Phone"
                                />
                                <label
                                    htmlFor="phone"
                                    className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-accent-red"
                                >
                                    Phone Number
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        setFormData({
                                            first_name: user.first_name || '',
                                            last_name: user.last_name || '',
                                            email: user.email || '',
                                            phone: user.phone || '',
                                        });
                                    }}
                                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">First Name</p>
                                <p className="font-semibold text-gray-900 text-lg">{user?.first_name || <span className="text-gray-400 italic">Not set</span>}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Name</p>
                                <p className="font-semibold text-gray-900 text-lg">{user?.last_name || <span className="text-gray-400 italic">Not set</span>}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email Address</p>
                                <p className="font-semibold text-gray-900 text-lg">{user?.email}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                                <p className="font-semibold text-gray-900 text-lg">{user?.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl md:col-span-2">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="font-semibold text-gray-900 text-lg">
                                    {user?.date_joined
                                        ? new Date(user.date_joined).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Activity Stats Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-accent-black mb-4">Your Activity</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-red/5 to-transparent rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent-red/10 rounded-lg text-accent-red">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Tournaments</span>
                                </div>
                                <span className="text-2xl font-black text-accent-red">{stats.tournaments}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-accent-green/5 to-transparent rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-accent-green/10 rounded-lg text-accent-green">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium text-gray-700">Orders</span>
                                </div>
                                <span className="text-2xl font-black text-accent-green">{stats.orders}</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Status Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-accent-black mb-4">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Role</span>
                                <span className="px-3 py-1 bg-gradient-to-r from-accent-red/10 to-accent-green/10 text-accent-black rounded-full text-sm font-bold">
                                    {user?.is_staff ? '🔐 Admin' : '👤 User'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-accent-black mb-4">Security</h3>
                        {!changingPassword ? (
                            <button
                                onClick={() => setChangingPassword(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Change Password
                            </button>
                        ) : (
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.old_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-0 outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-3 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                    >
                                        Update Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setChangingPassword(false);
                                            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                                        }}
                                        className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
