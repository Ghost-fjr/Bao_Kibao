import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Toast from '../../components/common/Toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const response = await api.get('/store/orders/');
            setOrders(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setToast({ message: 'Failed to load your orders', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="relative w-16 h-16">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-accent-green rounded-full animate-spin border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">My Orders</h1>
                <p className="text-gray-600 mt-2">Track and manage your store orders</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                    <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                    <Link
                        to="/store"
                        className="inline-block px-6 py-3 bg-accent-green text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1"
                    >
                        Browse Store
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-accent-black mb-1">Order #{order.id}</h3>
                                        <p className="text-gray-600 text-sm">
                                            Placed on {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                        {order.status || 'Pending'}
                                    </span>
                                </div>

                                <div className="border-t border-gray-100 pt-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                            <p className="text-lg font-bold text-accent-green">Ksh {order.total_amount || '0.00'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                                            <p className="font-medium text-gray-900">{order.payment_method || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                                            <p className="font-medium text-gray-900">{order.shipping_address || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {order.items && order.items.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-bold text-gray-700 mb-2">Order Items:</p>
                                            <div className="space-y-2">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700">
                                                            {item.product?.name || 'Product'} x {item.quantity}
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            Ksh {(item.price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-3">
                                        <Link
                                            to={`/dashboard/orders/${order.id}`}
                                            className="px-4 py-2 bg-accent-black text-white rounded-xl font-bold hover:bg-gray-900 transition-all"
                                        >
                                            View Details
                                        </Link>
                                        {order.status === 'pending' && (
                                            <button
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
