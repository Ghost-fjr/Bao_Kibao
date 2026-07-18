import { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import PageSkeleton from '../../components/common/PageSkeleton';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingOrder, setEditingOrder] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/store/orders/');
            setOrders(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load orders', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/store/orders/${orderId}/`, { status: newStatus });
            setToast({ message: 'Order status updated', type: 'success' });
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            setToast({ message: 'Failed to update status', type: 'error' });
        }
    };

    const updatePaymentStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/store/orders/${orderId}/`, { payment_status: newStatus });
            setToast({ message: 'Payment status updated', type: 'success' });
            fetchOrders();
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
            }
        } catch (error) {
            setToast({ message: 'Failed to update payment status', type: 'error' });
        }
    };

    const handleEditOrder = (order) => {
        setEditingOrder({
            id: order.id,
            shipping_name: order.shipping_name || '',
            shipping_email: order.shipping_email || '',
            shipping_phone: order.shipping_phone || '',
            shipping_address: order.shipping_address || '',
            shipping_city: order.shipping_city || '',
            shipping_country: order.shipping_country || '',
            notes: order.notes || '',
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`/store/orders/${editingOrder.id}/`, {
                shipping_name: editingOrder.shipping_name,
                shipping_email: editingOrder.shipping_email,
                shipping_phone: editingOrder.shipping_phone,
                shipping_address: editingOrder.shipping_address,
                shipping_city: editingOrder.shipping_city,
                shipping_country: editingOrder.shipping_country,
                notes: editingOrder.notes,
            });
            setToast({ message: 'Order updated successfully', type: 'success' });
            setEditingOrder(null);
            fetchOrders();
            if (selectedOrder?.id === editingOrder.id) {
                setSelectedOrder({ ...selectedOrder, ...editingOrder });
            }
        } catch (error) {
            setToast({ message: 'Failed to update order', type: 'error' });
        }
    };

    const handleDeleteOrder = async () => {
        try {
            await api.delete(`/store/orders/${deleteConfirm.id}/`);
            setToast({ message: 'Order deleted successfully', type: 'success' });
            setDeleteConfirm(null);
            setSelectedOrder(null);
            fetchOrders();
        } catch (error) {
            setToast({ message: 'Failed to delete order', type: 'error' });
        }
    };

    // Filtering logic
    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            shipped: 'bg-purple-100 text-purple-800 border-purple-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            refunded: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Stats
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        revenue: orders.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0),
    };

    if (loading) return <PageSkeleton type="dashboard" />;

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <ConfirmationModal
                    title="Delete Order"
                    message={`Are you sure you want to delete order #${deleteConfirm.order_number}? This action cannot be undone.`}
                    onConfirm={handleDeleteOrder}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Orders Management</h1>
                    <p className="text-gray-500 mt-1">Manage customer orders and track fulfillment</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Total Orders</p>
                    <p className="text-2xl font-black text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                    <p className="text-xs text-yellow-700 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-black text-yellow-800">{stats.pending}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-700 uppercase tracking-wider">Processing</p>
                    <p className="text-2xl font-black text-blue-800">{stats.processing}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-xs text-green-700 uppercase tracking-wider">Delivered</p>
                    <p className="text-2xl font-black text-green-800">{stats.delivered}</p>
                </div>
                <div className="bg-gradient-to-r from-accent-green/10 to-accent-red/10 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-700 uppercase tracking-wider">Revenue</p>
                    <p className="text-2xl font-black text-accent-green">Ksh {stats.revenue.toLocaleString()}</p>
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
                        placeholder="Search by order number, customer name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
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

            {/* Edit Order Modal */}
            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold">Edit Order Shipping Details</h2>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editingOrder.shipping_name}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, shipping_name: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editingOrder.shipping_phone}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, shipping_phone: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingOrder.shipping_email}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, shipping_email: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                                <textarea
                                    value={editingOrder.shipping_address}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, shipping_address: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    rows="2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        value={editingOrder.shipping_city}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, shipping_city: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Country</label>
                                    <input
                                        type="text"
                                        value={editingOrder.shipping_country}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, shipping_country: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={editingOrder.notes}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    rows="3"
                                    placeholder="Internal notes..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-accent-green text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingOrder(null)}
                                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-accent-black to-gray-800">
                            <div className="flex justify-between items-start">
                                <div className="text-white">
                                    <h2 className="text-2xl font-bold">Order #{selectedOrder.order_number}</h2>
                                    <p className="text-gray-300">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-300 hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Controls */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Payment Status</label>
                                    <select
                                        value={selectedOrder.payment_status}
                                        onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-accent-red"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-bold text-gray-900">Shipping Information</h3>
                                    <button
                                        onClick={() => { handleEditOrder(selectedOrder); setSelectedOrder(null); }}
                                        className="text-accent-red hover:underline text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <p><span className="text-gray-500">Name:</span> {selectedOrder.shipping_name}</p>
                                    <p><span className="text-gray-500">Phone:</span> {selectedOrder.shipping_phone}</p>
                                    <p><span className="text-gray-500">Email:</span> {selectedOrder.shipping_email}</p>
                                    <p><span className="text-gray-500">City:</span> {selectedOrder.shipping_city}</p>
                                    <p className="col-span-2"><span className="text-gray-500">Address:</span> {selectedOrder.shipping_address}</p>
                                    {selectedOrder.notes && (
                                        <p className="col-span-2"><span className="text-gray-500">Notes:</span> {selectedOrder.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">Order Items</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × Ksh {item.price}</p>
                                            </div>
                                            <p className="font-bold">Ksh {(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-900">
                                    <span className="text-lg font-bold">Total</span>
                                    <span className="text-2xl font-black text-accent-green">Ksh {parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => { handleEditOrder(selectedOrder); setSelectedOrder(null); }}
                                    className="flex-1 px-4 py-3 bg-accent-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    Edit Order
                                </button>
                                <button
                                    onClick={() => { setDeleteConfirm(selectedOrder); setSelectedOrder(null); }}
                                    className="px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Order #</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium">{order.shipping_name}</p>
                                        <p className="text-sm text-gray-500">{order.shipping_email}</p>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-accent-green">Ksh {parseFloat(order.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${getPaymentStatusColor(order.payment_status)}`}>
                                            {order.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-600 hover:text-accent-black hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleEditOrder(order)}
                                                className="p-2 text-gray-600 hover:text-accent-green hover:bg-green-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(order)}
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

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <p className="text-gray-500">No orders found</p>
                    </div>
                )}
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-500 text-center">
                Showing {filteredOrders.length} of {orders.length} orders
            </p>
        </div>
    );
};

export default OrdersManagement;
