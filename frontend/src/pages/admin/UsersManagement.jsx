import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [toast, setToast] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'donor',
        password: '',
        is_active: true,
        is_staff: false,
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async (url = '/users/') => {
        try {
            const isLoadMore = url !== '/users/';
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const response = await api.get(url);
            
            if (isLoadMore) {
                setUsers(prev => [...prev, ...(response.data.results || response.data)]);
            } else {
                setUsers(response.data.results || response.data);
            }
            setNextPage(response.data.next || null);
        } catch (error) {
            setToast({ message: 'Failed to load users', type: 'error' });
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/', formData);
            setToast({ message: 'User created successfully', type: 'success' });
            setShowCreateModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            const errorMsg = error.response?.data?.email?.[0] ||
                error.response?.data?.username?.[0] ||
                'Failed to create user';
            setToast({ message: errorMsg, type: 'error' });
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        try {
            const updateData = { ...formData };
            if (!updateData.password) {
                delete updateData.password; // Don't send empty password
            }
            await api.patch(`/users/${editingUser.id}/`, updateData);
            setToast({ message: 'User updated successfully', type: 'success' });
            setEditingUser(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            setToast({ message: 'Failed to update user', type: 'error' });
        }
    };

    const handleDeleteUser = async () => {
        try {
            await api.delete(`/users/${deleteConfirm.id}/`);
            setToast({ message: 'User deleted successfully', type: 'success' });
            setDeleteConfirm(null);
            fetchUsers();
        } catch (error) {
            setToast({ message: 'Failed to delete user', type: 'error' });
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

    const openEditModal = (user) => {
        setFormData({
            email: user.email || '',
            username: user.username || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            phone: user.phone || '',
            role: user.role || 'donor',
            password: '',
            is_active: user.is_active,
            is_staff: user.is_staff,
        });
        setEditingUser(user);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            username: '',
            first_name: '',
            last_name: '',
            phone: '',
            role: 'donor',
            password: '',
            is_active: true,
            is_staff: false,
        });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter || (roleFilter === 'admin' && user.is_staff);
        return matchesSearch && matchesRole;
    });

    // Stats
    const stats = {
        total: users.length,
        admins: users.filter(u => u.is_staff || u.role === 'admin').length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length,
    };

    const getRoleBadge = (role, isStaff) => {
        if (isStaff || role === 'admin') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Admin</span>;
        }
        if (role === 'staff') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Staff</span>;
        }
        if (role === 'captain') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">Captain</span>;
        }
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">User</span>;
    };

    if (loading) return <PageSkeleton type="dashboard" />;
                </div>
                <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    // User Form Modal
    const UserFormModal = ({ isEdit, onSubmit, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-accent-black to-gray-800">
                    <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit User' : 'Create New User'}</h2>
                </div>
                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Username *</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Password {isEdit && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            required={!isEdit}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red outline-none"
                            >
                                <option value="donor">User</option>
                                <option value="captain">Captain</option>
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_staff}
                                    onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-accent-red focus:ring-accent-red"
                                />
                                <span className="text-sm font-medium text-gray-700">Staff Access</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmationModal
                    title="Delete User"
                    message={`Are you sure you want to delete "${deleteConfirm.email}"? This action cannot be undone.`}
                    onConfirm={handleDeleteUser}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <UserFormModal
                    isEdit={false}
                    onSubmit={handleCreateUser}
                    onClose={() => { setShowCreateModal(false); resetForm(); }}
                />
            )}
            {editingUser && (
                <UserFormModal
                    isEdit={true}
                    onSubmit={handleEditUser}
                    onClose={() => { setEditingUser(null); resetForm(); }}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Users Management</h1>
                    <p className="text-gray-500 mt-1">Manage user accounts and permissions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Users</p>
                    <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-xs text-purple-700 uppercase tracking-wider">Admins</p>
                    <p className="text-2xl font-black text-purple-800">{stats.admins}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-green-700 uppercase tracking-wider">Active</p>
                    <p className="text-2xl font-black text-green-800">{stats.active}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <p className="text-xs text-red-700 uppercase tracking-wider">Inactive</p>
                    <p className="text-2xl font-black text-red-800">{stats.inactive}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red outline-none"
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="captain">Captain</option>
                    <option value="donor">User</option>
                </select>
            </div>

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
                                        <button
                                            onClick={() => toggleUserActive(user.id, !user.is_active)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(user.date_joined || user.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="p-2 text-gray-600 hover:text-accent-black hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-gray-600 hover:text-accent-green hover:bg-green-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(user)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
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

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedUser(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-accent-black to-gray-800 rounded-t-2xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">User Details</h2>
                                <button onClick={() => setSelectedUser(null)} className="text-gray-300 hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
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

                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <p><span className="text-gray-500">Username:</span> @{selectedUser.username || 'N/A'}</p>
                                <p><span className="text-gray-500">Phone:</span> {selectedUser.phone || 'N/A'}</p>
                                <p><span className="text-gray-500">Role:</span> {getRoleBadge(selectedUser.role, selectedUser.is_staff)}</p>
                                <p><span className="text-gray-500">Status:</span> {selectedUser.is_active ? '✅ Active' : '❌ Inactive'}</p>
                                <p><span className="text-gray-500">Staff Access:</span> {selectedUser.is_staff ? '✅ Yes' : '❌ No'}</p>
                                <p><span className="text-gray-500">Joined:</span> {new Date(selectedUser.date_joined || selectedUser.created_at).toLocaleDateString()}</p>
                                <p><span className="text-gray-500">Last Login:</span> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { openEditModal(selectedUser); setSelectedUser(null); }}
                                    className="flex-1 px-4 py-3 bg-accent-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit User
                                </button>
                                <button
                                    onClick={() => { setDeleteConfirm(selectedUser); setSelectedUser(null); }}
                                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Load More Button */}
            {nextPage && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => fetchUsers(nextPage)}
                        disabled={loadingMore}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                            </>
                        ) : (
                            'Load More Users'
                        )}
                    </button>
                </div>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 text-center">
                Showing {filteredUsers.length} of {users.length} loaded users
            </p>
        </div>
    );
};

export default UsersManagement;
