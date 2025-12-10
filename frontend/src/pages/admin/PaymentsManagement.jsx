import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const PaymentsManagement = () => {
    const [activeTab, setActiveTab] = useState('payments');
    const [payments, setPayments] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refundConfirm, setRefundConfirm] = useState(null);

    useEffect(() => {
        if (activeTab === 'payments') {
            fetchPayments();
        } else {
            fetchDonations();
        }
    }, [activeTab]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments/');
            const paymentsData = response.data.results || response.data;
            setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        } catch (error) {
            setToast({ message: 'Failed to load payments', type: 'error' });
            setPayments([]); // Ensure payments is always an array
        } finally {
            setLoading(false);
        }
    };

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments/donations/');
            const donationsData = response.data.results || response.data;
            setDonations(Array.isArray(donationsData) ? donationsData : []);
        } catch (error) {
            setToast({ message: 'Failed to load donations', type: 'error' });
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    const updatePaymentStatus = async (paymentId, newStatus) => {
        try {
            await api.patch(`/payments/${paymentId}/`, { status: newStatus });
            setToast({ message: `Payment marked as ${newStatus}`, type: 'success' });
            fetchPayments();
            if (selectedPayment?.id === paymentId) {
                setSelectedPayment({ ...selectedPayment, status: newStatus });
            }
        } catch (error) {
            setToast({ message: 'Failed to update payment status', type: 'error' });
        }
    };

    const handleRefund = async () => {
        try {
            await api.patch(`/payments/${refundConfirm.id}/`, { status: 'refunded' });
            setToast({ message: 'Payment refunded successfully', type: 'success' });
            setRefundConfirm(null);
            fetchPayments();
        } catch (error) {
            setToast({ message: 'Failed to process refund', type: 'error' });
        }
    };

    // Filtering and search
    const filteredPayments = useMemo(() => {
        if (!Array.isArray(payments)) return [];
        return payments.filter(p => {
            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
            const matchesSearch = searchTerm === '' ||
                p.phone_number?.includes(searchTerm) ||
                p.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(p.id).includes(searchTerm);
            return matchesStatus && matchesSearch;
        });
    }, [payments, statusFilter, searchTerm]);

    // Stats
    const stats = useMemo(() => {
        if (!Array.isArray(payments)) return { total: 0, totalAmount: 0, pending: 0, succeeded: 0, failed: 0 };
        return {
            total: payments.length,
            totalAmount: payments.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0),
            pending: payments.filter(p => p.status === 'pending').length,
            succeeded: payments.filter(p => p.status === 'succeeded').length,
            failed: payments.filter(p => p.status === 'failed').length,
            refunded: payments.filter(p => p.status === 'refunded').length,
        };
    }, [payments]);

    const donationStats = useMemo(() => ({
        total: donations.length,
        totalAmount: donations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0),
    }), [donations]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            succeeded: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-purple-100 text-purple-800 border-purple-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

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
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Refund Confirmation */}
            {refundConfirm && (
                <ConfirmationModal
                    title="Process Refund"
                    message={`Are you sure you want to refund ${refundConfirm.currency} ${refundConfirm.amount} to ${refundConfirm.phone_number}?`}
                    onConfirm={handleRefund}
                    onCancel={() => setRefundConfirm(null)}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Payments & Donations</h1>
                    <p className="text-gray-500 mt-1">Track and manage M-Pesa payments and donations</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'payments', label: 'M-Pesa Payments', count: payments.length },
                        { key: 'donations', label: 'Donations', count: donations.length }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === tab.key
                                ? 'border-accent-red text-accent-red'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-accent-red/10' : 'bg-gray-100'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'payments' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
                            <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-r from-accent-green/10 to-accent-green/5 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-700 uppercase tracking-wider">Revenue</p>
                            <p className="text-2xl font-black text-accent-green">Ksh {stats.totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                            <p className="text-xs text-yellow-700 uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-black text-yellow-800">{stats.pending}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-700 uppercase tracking-wider">Succeeded</p>
                            <p className="text-2xl font-black text-green-800">{stats.succeeded}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <p className="text-xs text-red-700 uppercase tracking-wider">Failed</p>
                            <p className="text-2xl font-black text-red-800">{stats.failed}</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <p className="text-xs text-purple-700 uppercase tracking-wider">Refunded</p>
                            <p className="text-2xl font-black text-purple-800">{stats.refunded}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by phone, receipt number, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'pending', 'processing', 'succeeded', 'failed', 'refunded'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${statusFilter === status
                                        ? 'bg-accent-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Detail Modal */}
                    {selectedPayment && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPayment(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-accent-black to-gray-800 rounded-t-2xl">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-white">Payment #{selectedPayment.id}</h2>
                                        <button onClick={() => setSelectedPayment(null)} className="text-gray-300 hover:text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="text-2xl font-black text-accent-green">{selectedPayment.currency} {selectedPayment.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Status</p>
                                            <select
                                                value={selectedPayment.status}
                                                onChange={(e) => updatePaymentStatus(selectedPayment.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(selectedPayment.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="succeeded">Succeeded</option>
                                                <option value="failed">Failed</option>
                                                <option value="refunded">Refunded</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-sm text-gray-500 uppercase">M-Pesa Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <p><span className="text-gray-500">Phone:</span> {selectedPayment.phone_number || 'N/A'}</p>
                                            <p><span className="text-gray-500">Type:</span> <span className="capitalize">{selectedPayment.payment_type}</span></p>
                                            <p><span className="text-gray-500">Receipt:</span> <span className="font-mono">{selectedPayment.mpesa_receipt_number || 'N/A'}</span></p>
                                            <p><span className="text-gray-500">Transaction ID:</span> <span className="font-mono text-xs">{selectedPayment.mpesa_transaction_id || 'N/A'}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <p>Created: {new Date(selectedPayment.created_at).toLocaleString()}</p>
                                        {selectedPayment.paid_at && <p>Paid: {new Date(selectedPayment.paid_at).toLocaleString()}</p>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        {selectedPayment.status === 'succeeded' && (
                                            <button
                                                onClick={() => { setRefundConfirm(selectedPayment); setSelectedPayment(null); }}
                                                className="flex-1 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                </svg>
                                                Process Refund
                                            </button>
                                        )}
                                        {selectedPayment.status === 'pending' && (
                                            <button
                                                onClick={() => updatePaymentStatus(selectedPayment.id, 'succeeded')}
                                                className="flex-1 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-colors"
                                            >
                                                Mark as Paid
                                            </button>
                                        )}
                                        {(selectedPayment.status === 'pending' || selectedPayment.status === 'processing') && (
                                            <button
                                                onClick={() => updatePaymentStatus(selectedPayment.id, 'failed')}
                                                className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                            >
                                                Mark Failed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payments Table */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Receipt</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm font-bold">#{payment.id}</td>
                                            <td className="px-6 py-4">{payment.phone_number || 'N/A'}</td>
                                            <td className="px-6 py-4 font-bold text-accent-green">{payment.currency} {payment.amount}</td>
                                            <td className="px-6 py-4 capitalize">{payment.payment_type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">{payment.mpesa_receipt_number || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedPayment(payment)}
                                                        className="p-2 text-gray-600 hover:text-accent-black hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View/Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    {payment.status === 'succeeded' && (
                                                        <button
                                                            onClick={() => setRefundConfirm(payment)}
                                                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="Refund"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredPayments.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <p className="text-gray-500">No payments found</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'donations' && (
                <>
                    {/* Donation Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Donations</p>
                            <p className="text-2xl font-black text-gray-900">{donationStats.total}</p>
                        </div>
                        <div className="bg-gradient-to-r from-accent-green/10 to-accent-green/5 rounded-xl p-4 border border-green-100">
                            <p className="text-xs text-green-700 uppercase tracking-wider">Total Amount</p>
                            <p className="text-2xl font-black text-accent-green">Ksh {donationStats.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Donor</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Message</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {donations.map((donation) => (
                                        <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-green to-accent-black flex items-center justify-center text-white font-bold">
                                                        {donation.is_anonymous ? '?' : donation.donor_name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">
                                                        {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p>{donation.donor_email}</p>
                                                <p className="text-gray-500">{donation.donor_phone || '-'}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-accent-green">{donation.currency} {donation.amount}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{donation.message || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(donation.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {donations.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-500">No donations yet</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Results count */}
            <p className="text-sm text-gray-500 text-center">
                {activeTab === 'payments'
                    ? `Showing ${filteredPayments.length} of ${payments.length} payments`
                    : `Showing ${donations.length} donations`}
            </p>
        </div>
    );
};

export default PaymentsManagement;
