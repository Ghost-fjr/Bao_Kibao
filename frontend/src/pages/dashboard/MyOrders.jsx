import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

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

    // Filter logic
    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status?.toLowerCase() === statusFilter);
    }, [orders, statusFilter]);

    // Status tabs configuration
    const statusTabs = [
        { value: 'all', label: 'All Orders', icon: null },
        { value: 'pending', label: 'Pending', color: 'yellow' },
        { value: 'processing', label: 'Processing', color: 'blue' },
        { value: 'shipped', label: 'Shipped', color: 'purple' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
    ];

    // Order progress tracker component
    const OrderProgressTracker = ({ status }) => {
        const steps = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(status?.toLowerCase()) || 0;
        const progressPercent = ((currentIndex + 1) / steps.length) * 100;

        const stepLabels = {
            pending: 'Order Placed',
            processing: 'Processing',
            shipped: 'Shipped',
            delivered: 'Delivered'
        };

        const stepIcons = {
            pending: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            processing: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            ),
            shipped: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            delivered: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )
        };

        if (status?.toLowerCase() === 'cancelled') {
            return (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium">Order Cancelled</span>
                </div>
            );
        }

        return (
            <div className="py-4">
                {/* Progress bar */}
                <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                    <div
                        className="absolute h-full bg-gradient-to-r from-accent-red via-yellow-500 to-accent-green rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                {/* Steps */}
                <div className="flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div key={step} className="flex flex-col items-center flex-1">
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isCompleted
                                        ? 'bg-accent-green border-accent-green text-white'
                                        : 'bg-white border-gray-300 text-gray-400'}
                                    ${isCurrent ? 'ring-4 ring-accent-green/30 scale-110' : ''}
                                `}>
                                    {isCompleted ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : stepIcons[step]}
                                </div>
                                <span className={`text-xs mt-2 font-medium text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {stepLabels[step]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await api.patch(`/store/orders/${orderId}/`, { status: 'cancelled' });
            setToast({ message: 'Order cancelled successfully', type: 'success' });
            fetchMyOrders();
        } catch (error) {
            console.error('Error cancelling order:', error);
            setToast({ message: 'Failed to cancel order', type: 'error' });
        }
    };

    if (loading) return <PageSkeleton type="dashboard" />;
                </div>
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
                    ))}
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

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">My Orders</h1>
                <p className="text-gray-600 mt-2">Track and manage your store orders</p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl">
                {statusTabs.map(tab => {
                    const count = tab.value === 'all'
                        ? orders.length
                        : orders.filter(o => o.status?.toLowerCase() === tab.value).length;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                                ${statusFilter === tab.value
                                    ? 'bg-white text-accent-black shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'}
                            `}
                        >
                            {tab.label}
                            {count > 0 && (
                                <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-bold
                                    ${statusFilter === tab.value ? 'bg-accent-black text-white' : 'bg-gray-200 text-gray-600'}
                                `}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-green/20 to-accent-red/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-3">No Orders Yet</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Start shopping and support the Bao Kibao cause. Your purchases make a difference!
                    </p>
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-green to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Browse Store
                    </Link>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No {statusFilter} orders</h3>
                    <p className="text-gray-600">You don't have any orders with this status</p>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className="mt-4 text-accent-green font-medium hover:underline"
                    >
                        View all orders
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order, index) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Order Header */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gray-50 border-b border-gray-100">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-green to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-accent-black">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                                <span className={`self-start md:self-auto px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                    {order.status || 'Pending'}
                                </span>
                            </div>

                            <div className="p-6">
                                {/* Order Progress Tracker */}
                                <div className="mb-6">
                                    <OrderProgressTracker status={order.status} />
                                </div>

                                {/* Order Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                                        <p className="text-2xl font-black text-accent-green">Ksh {order.total_amount || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                                        <p className="font-semibold text-gray-900 capitalize">{order.payment_method || 'Not specified'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery Address</p>
                                        <p className="font-semibold text-gray-900 truncate">{order.shipping_address || 'Not specified'}</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                {order.items && order.items.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-sm font-bold text-gray-700 mb-3">Order Items ({order.items.length})</p>
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                    {/* Product thumbnail placeholder */}
                                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {item.product?.image ? (
                                                            <img
                                                                src={item.product.image}
                                                                alt={item.product?.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 truncate">{item.product?.name || 'Product'}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-bold text-gray-900 whitespace-nowrap">
                                                        Ksh {(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        to={`/dashboard/orders/${order.id}`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-800 to-accent-black text-white rounded-xl font-bold hover:from-accent-green hover:to-green-700 transition-all"
                                    >
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                    {order.status?.toLowerCase() === 'pending' && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancel Order
                                        </button>
                                    )}
                                    {order.status?.toLowerCase() === 'delivered' && (
                                        <button className="flex items-center gap-2 px-5 py-2.5 bg-accent-green/10 text-accent-green rounded-xl font-bold hover:bg-accent-green/20 transition-all border border-accent-green/20">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Reorder
                                        </button>
                                    )}
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
