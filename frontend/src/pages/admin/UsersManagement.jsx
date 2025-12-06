import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load users', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            await api.patch(`/users/${userId}/`, { role: newRole });
            setToast({ message: 'User role updated', type: 'success' });
            fetchUsers();
        } catch (error) {
            setToast({ message: 'Failed to update role', type: 'error' });
        }
    };

    const toggleUserActive = async (userId, isActive) => {
        try {
            await api.patch(`/users/${userId}/`, { is_active: isActive });
            setToast({ message: `User ${isActive ? 'activated' : 'deactivated'}`, type: 'success' });
            fetchUsers();
        } catch (error) {
            setToast({ message: 'Failed to update user', type: 'error' });
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role, isStaff) => {
        if (isStaff || role === 'admin') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Admin</span>;
        }
        if (role === 'staff') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Staff</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">User</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-black text-gray-900">Users Management</h1>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red w-full sm:w-64"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold">User Details</h2>
                            <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-red to-accent-black flex items-center justify-center text-white text-2xl font-bold">
                                    {selectedUser.first_name?.charAt(0) || selectedUser.email?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedUser.first_name} {selectedUser.last_name}</h3>
                                    <p className="text-gray-500">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                                    <select
                                        value={selectedUser.role || 'user'}
                                        onChange={(e) => {
                                            updateUserRole(selectedUser.id, e.target.value);
                                            setSelectedUser({ ...selectedUser, role: e.target.value });
                                        }}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <button
                                        onClick={() => {
                                            toggleUserActive(selectedUser.id, !selectedUser.is_active);
                                            setSelectedUser({ ...selectedUser, is_active: !selectedUser.is_active });
                                        }}
                                        className={`w-full px-4 py-2 rounded-lg font-bold transition-colors ${selectedUser.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                    >
                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <p><span className="text-gray-500">Username:</span> {selectedUser.username || 'N/A'}</p>
                                <p><span className="text-gray-500">Phone:</span> {selectedUser.phone_number || 'N/A'}</p>
                                <p><span className="text-gray-500">Joined:</span> {new Date(selectedUser.date_joined || selectedUser.created_at).toLocaleDateString()}</p>
                                <p><span className="text-gray-500">Last Login:</span> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-red to-accent-black flex items-center justify-center text-white font-bold">
                                                {user.first_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold">{user.first_name} {user.last_name}</p>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role, user.is_staff)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(user.date_joined || user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersManagement;
