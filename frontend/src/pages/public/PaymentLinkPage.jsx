import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const PaymentLinkPage = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [paymentLink, setPaymentLink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [formData, setFormData] = useState({
        phone_number: '',
        payer_name: '',
        amount: ''
    });

    useEffect(() => {
        fetchPaymentLink();
    }, [code]);

    const fetchPaymentLink = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/payments/public/payment-link/${code}/`);
            setPaymentLink(response.data);
            setFormData(prev => ({ ...prev, amount: response.data.amount }));
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Payment link not found or has expired');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const payload = {
                phone_number: formData.phone_number,
                payer_name: formData.payer_name || 'Guest',
                amount: paymentLink.allow_custom_amount ? formData.amount : paymentLink.amount
            };

            const response = await api.post(`/payments/public/payment-link/${code}/`, payload);

            if (response.data.success) {
                setPaymentSuccess(true);
                setToast({
                    message: response.data.message,
                    type: 'success'
                });
            }
        } catch (err) {
            setToast({
                message: err.response?.data?.error || 'Failed to initiate payment',
                type: 'error'
            });
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <PageSkeleton type="default" />;

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Link Unavailable</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-gradient-to-r from-accent-red to-red-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Go to Homepage
                    </button>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Initiated!</h2>
                    <p className="text-gray-600 mb-6">
                        Please check your phone and enter your M-Pesa PIN to complete the payment.
                    </p>
                    <div className="bg-green-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-green-800">
                            <span className="font-bold">Amount:</span> {paymentLink.currency} {formData.amount}
                        </p>
                        <p className="text-sm text-green-800 mt-1">
                            <span className="font-bold">Phone:</span> {formData.phone_number}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent-black to-gray-800 p-8">
                    <div className="text-center">
                        <div className="inline-block p-3 bg-white/10 rounded-2xl mb-4">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">{paymentLink.title}</h1>
                        <p className="text-gray-300">{paymentLink.description}</p>
                    </div>
                </div>

                {/* Payment Amount */}
                <div className="bg-gradient-to-r from-accent-green/10 to-accent-green/5 p-6 border-b border-gray-100">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                        <p className="text-5xl font-black text-accent-green mb-2">
                            {paymentLink.currency} {paymentLink.allow_custom_amount ? formData.amount : paymentLink.amount}
                        </p>
                        {paymentLink.allow_custom_amount && (
                            <p className="text-xs text-gray-500">Minimum: {paymentLink.currency} {paymentLink.amount}</p>
                        )}
                    </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Your Name
                        </label>
                        <input
                            type="text"
                            value={formData.payer_name}
                            onChange={(e) => setFormData({ ...formData, payer_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            M-Pesa Phone Number *
                        </label>
                        <input
                            type="tel"
                            required
                            value={formData.phone_number}
                            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                            placeholder="254712345678"
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX</p>
                    </div>

                    {paymentLink.allow_custom_amount && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Custom Amount (KES) *
                            </label>
                            <input
                                type="number"
                                required
                                min={paymentLink.amount}
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                                placeholder={`Minimum ${paymentLink.amount}`}
                            />
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-blue-800">
                            <p className="font-bold mb-1">How it works:</p>
                            <ol className="list-decimal list-inside space-y-1">
                                <li>Enter your M-Pesa phone number</li>
                                <li>Click "Pay Now" below</li>
                                <li>Check your phone for STK push</li>
                                <li>Enter your M-Pesa PIN to complete</li>
                            </ol>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full px-6 py-4 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-black text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Processing...
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Pay Now
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                        Powered by M-Pesa • Secure Payment
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PaymentLinkPage;
