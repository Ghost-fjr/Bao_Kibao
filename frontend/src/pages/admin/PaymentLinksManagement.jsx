import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const PaymentLinksManagement = () => {
    const [paymentLinks, setPaymentLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        allow_custom_amount: false,
        max_uses: '',
        expires_at: ''
    });

    useEffect(() => {
        fetchPaymentLinks();
    }, []);

    const fetchPaymentLinks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments/payment-links/');
            setPaymentLinks(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load payment links', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                max_uses: formData.max_uses || null,
                expires_at: formData.expires_at || null
            };

            if (editingLink) {
                await api.patch(`/payments/payment-links/${editingLink.id}/`, payload);
                setToast({ message: 'Payment link updated successfully', type: 'success' });
            } else {
                await api.post('/payments/payment-links/', payload);
                setToast({ message: 'Payment link created successfully', type: 'success' });
            }

            setShowModal(false);
            resetForm();
            fetchPaymentLinks();
        } catch (error) {
            setToast({ message: error.response?.data?.detail || 'Failed to save payment link', type: 'error' });
        }
    };

    const handleEdit = (link) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            description: link.description,
            amount: link.amount,
            allow_custom_amount: link.allow_custom_amount,
            max_uses: link.max_uses || '',
            expires_at: link.expires_at ? link.expires_at.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/payments/payment-links/${deleteConfirm.id}/`);
            setToast({ message: 'Payment link deleted successfully', type: 'success' });
            setDeleteConfirm(null);
            fetchPaymentLinks();
        } catch (error) {
            setToast({ message: 'Failed to delete payment link', type: 'error' });
        }
    };

    const toggleActive = async (link) => {
        try {
            await api.post(`/payments/payment-links/${link.id}/toggle_active/`);
            setToast({ message: `Payment link ${link.is_active ? 'deactivated' : 'activated'}`, type: 'success' });
            fetchPaymentLinks();
        } catch (error) {
            setToast({ message: 'Failed to toggle payment link status', type: 'error' });
        }
    };

    const copyToClipboard = async (link) => {
        try {
            await navigator.clipboard.writeText(link.link_url);
            setToast({ message: 'Link copied to clipboard!', type: 'success' });
        } catch (error) {
            setToast({ message: 'Failed to copy link', type: 'error' });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            amount: '',
            allow_custom_amount: false,
            max_uses: '',
            expires_at: ''
        });
        setEditingLink(null);
    };

    const filteredLinks = useMemo(() => {
        return paymentLinks.filter(link =>
            link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.unique_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [paymentLinks, searchTerm]);

    const stats = useMemo(() => ({
        total: paymentLinks.length,
        active: paymentLinks.filter(l => l.is_active).length,
        totalCollected: paymentLinks.reduce((sum, l) => sum + (l.total_collected || 0), 0),
        totalUses: paymentLinks.reduce((sum, l) => sum + (l.current_uses || 0), 0)
    }), [paymentLinks]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded-xl w-64"></div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
                </div>
                <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmationModal
                    title="Delete Payment Link"
                    message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="animate-fade-in">
                    <h1 className="text-4xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-accent-red to-gray-900">
                        Payment Links
                    </h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Create and manage shareable payment links
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="group px-6 py-3.5 bg-gradient-to-r from-accent-red via-red-600 to-red-700 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-accent-red/30 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                    <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Payment Link
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Links</p>
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-accent-red/10 transition-colors">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-gray-900">{stats.total}</p>
                </div>
                <div className="group bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Active</p>
                        <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center group-hover:bg-green-300 transition-colors">
                            <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-green-900">{stats.active}</p>
                </div>
                <div className="group bg-gradient-to-br from-accent-green/10 via-accent-green/5 to-green-50 rounded-2xl p-6 border border-green-200 hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Total Collected</p>
                        <div className="w-10 h-10 bg-green-200 rounded-xl flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
                            <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-black bg-gradient-to-r from-accent-green to-green-700 bg-clip-text text-transparent">
                        Ksh {stats.totalCollected.toLocaleString()}
                    </p>
                </div>
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Uses</p>
                        <div className="w-10 h-10 bg-blue-200 rounded-xl flex items-center justify-center group-hover:bg-blue-300 transition-colors">
                            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-black text-blue-900">{stats.totalUses}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative group">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by title or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-4 focus:ring-accent-red/10 outline-none transition-all shadow-sm hover:shadow-md"
                />
            </div>

            {/* Payment Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLinks.map((link, index) => (
                    <div
                        key={link.id}
                        className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500 hover:-translate-y-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className={`h-1.5 ${link.is_active ? 'bg-gradient-to-r from-accent-green via-green-500 to-green-600' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}></div>
                        <div className="p-6 space-y-4">
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-black text-lg text-gray-900 line-clamp-1 group-hover:text-accent-red transition-colors">{link.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{link.description}</p>
                                </div>
                                <span className={`ml-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${link.is_active ? 'bg-green-100 text-green-800 ring-2 ring-green-200' : 'bg-gray-100 text-gray-600 ring-2 ring-gray-200'}`}>
                                    {link.is_active ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                                            Active
                                        </span>
                                    ) : (
                                        'Inactive'
                                    )}
                                </span>
                            </div>

                            {/* Amount and Code */}
                            <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-100">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Amount</p>
                                    <p className="text-2xl font-black bg-gradient-to-r from-accent-green to-green-700 bg-clip-text text-transparent">
                                        {link.currency} {link.amount}
                                    </p>
                                    {link.allow_custom_amount && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            Min. amount
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Code</p>
                                    <p className="font-mono font-black text-gray-900 text-sm bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        {link.unique_code}
                                    </p>
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="space-y-3 pt#2">
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-gray-600 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Uses
                                    </span>
                                    <span className="font-black text-gray-900">{link.current_uses}{link.max_uses ? ` / ${link.max_uses}` : ''}</span>
                                </div>
                                {link.max_uses && (
                                    <div className="relative">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-accent-red via-red-600 to-red-700 h-2.5 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-accent-red/30"
                                                style={{ width: `${Math.min(link.usage_percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="absolute right-0 -top-5 text-xs font-bold text-accent-red">{link.usage_percentage}%</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm items-center pt-1">
                                    <span className="text-gray-600 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Collected
                                    </span>
                                    <span className="font-black bg-gradient-to-r from-accent-green to-green-700 bg-clip-text text-transparent">
                                        Ksh {link.total_collected?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => copyToClipboard(link)}
                                    className="group/btn flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-black to-gray-800 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-accent-black/30 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                                    title="Copy Link"
                                >
                                    <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </button>
                                <button
                                    onClick={() => handleEdit(link)}
                                    className="p-2.5 text-gray-600 hover:text-white hover:bg-accent-black rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                                    title="Edit"
                                >
                                    <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => toggleActive(link)}
                                    className="p-2.5 text-gray-600 hover:text-white hover:bg-accent-green rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                                    title="Toggle Status"
                                >
                                    <svg className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setDeleteConfirm(link)}
                                    className="p-2.5 text-gray-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredLinks.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <p className="text-gray-500 text-lg">No payment links found</p>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Create Your First Payment Link
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => { setShowModal(false); resetForm(); }}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-accent-black to-gray-800">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-white">{editingLink ? 'Edit Payment Link' : 'Create Payment Link'}</h2>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-300 hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                    placeholder="e.g., Tournament Registration Fee"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                    placeholder="Describe the purpose of this payment..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount (KES) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                        placeholder="1000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Max Uses</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="allow_custom_amount"
                                    checked={formData.allow_custom_amount}
                                    onChange={(e) => setFormData({ ...formData, allow_custom_amount: e.target.checked })}
                                    className="w-5 h-5 text-accent-red focus:ring-accent-red/20 rounded"
                                />
                                <label htmlFor="allow_custom_amount" className="text-sm font-medium text-gray-700">
                                    Allow users to enter custom amounts (amount will be minimum)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {editingLink ? 'Update' : 'Create'} Payment Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentLinksManagement;
