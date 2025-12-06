import { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/common/Toast';

const PaymentsManagement = () => {
    const [activeTab, setActiveTab] = useState('payments');
    const [payments, setPayments] = useState([]);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);

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
            setPayments(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load payments', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchDonations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/payments/donations/');
            setDonations(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load donations', type: 'error' });
            setDonations([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = statusFilter === 'all'
        ? payments
        : payments.filter(p => p.status === statusFilter);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            succeeded: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900">Payments & Donations</h1>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'payments', label: 'M-Pesa Payments' },
                        { key: 'donations', label: 'Donations' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${activeTab === tab.key
                                    ? 'border-accent-red text-accent-red'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'payments' && (
                <>
                    {/* Filter buttons */}
                    <div className="flex gap-2">
                        {['all', 'pending', 'processing', 'succeeded', 'failed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${statusFilter === status
                                        ? 'bg-accent-green text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Payment Detail Modal */}
                    {selectedPayment && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedPayment(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-xl font-bold">Payment Details</h2>
                                    <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Amount</p>
                                            <p className="text-2xl font-black">{selectedPayment.currency} {selectedPayment.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${getStatusColor(selectedPayment.status)}`}>
                                                {selectedPayment.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <h3 className="font-bold text-sm text-gray-500 uppercase">M-Pesa Details</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <p><span className="text-gray-500">Phone:</span> {selectedPayment.phone_number || 'N/A'}</p>
                                            <p><span className="text-gray-500">Receipt:</span> {selectedPayment.mpesa_receipt_number || 'N/A'}</p>
                                            <p className="col-span-2"><span className="text-gray-500">Transaction ID:</span> {selectedPayment.mpesa_transaction_id || 'N/A'}</p>
                                            <p className="col-span-2"><span className="text-gray-500">Checkout ID:</span> {selectedPayment.mpesa_checkout_request_id || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <p>Type: {selectedPayment.payment_type}</p>
                                        <p>Created: {new Date(selectedPayment.created_at).toLocaleString()}</p>
                                        {selectedPayment.paid_at && <p>Paid: {new Date(selectedPayment.paid_at).toLocaleString()}</p>}
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
                                            <td className="px-6 py-4 font-mono text-sm">{payment.id}</td>
                                            <td className="px-6 py-4">{payment.phone_number || 'N/A'}</td>
                                            <td className="px-6 py-4 font-bold">{payment.currency} {payment.amount}</td>
                                            <td className="px-6 py-4 capitalize">{payment.payment_type}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(payment.status)}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm">{payment.mpesa_receipt_number || '-'}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(payment.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedPayment(payment)}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                                >
                                                    View
                                                </button>
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
                                        <td className="px-6 py-4 font-bold text-green-600">{donation.currency} {donation.amount}</td>
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
            )}
        </div>
    );
};

export default PaymentsManagement;
