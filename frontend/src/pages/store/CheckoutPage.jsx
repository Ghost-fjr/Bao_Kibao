import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../../services/store';
import api from '../../services/api';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [total, setTotal] = useState(0);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        phone: ''
    });

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const cartData = await storeService.getCart();
                if (cartData && cartData.items) {
                    const formattedItems = cartData.items.map(item => {
                        let imageUrl = item.product_details.image;
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            imageUrl = `http://localhost:8000${imageUrl}`;
                        }

                        return {
                            id: item.id,
                            productId: item.product_details.id,
                            name: item.product_details.name,
                            price: parseFloat(item.product_details.price),
                            quantity: item.quantity,
                            image: imageUrl,
                            subtotal: parseFloat(item.subtotal)
                        };
                    });
                    setCartItems(formattedItems);
                    setTotal(parseFloat(cartData.total_amount || 0));
                }
            } catch (error) {
                console.error("Failed to fetch cart:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create order first
            const orderData = {
                shipping_name: shippingInfo.fullName,
                shipping_email: shippingInfo.email,
                shipping_phone: shippingInfo.phone,
                shipping_address: shippingInfo.address,
                shipping_city: shippingInfo.city,
                shipping_country: 'Kenya',
                payment_method: 'mpesa',
            };

            const order = await storeService.createOrder(orderData);

            // Initiate M-Pesa payment
            const paymentData = {
                phone_number: shippingInfo.phone,
                amount: total,
                payment_type: 'order',
                account_reference: `ORDER-${order.id}`,
                transaction_desc: `Payment for Order #${order.order_number}`
            };

            const paymentResponse = await api.post('/payments/mpesa/initiate/', paymentData);

            if (paymentResponse.data.success) {
                alert('STK Push sent to your phone! Please enter your M-Pesa PIN to complete payment.');
                // Poll for payment status
                const paymentId = paymentResponse.data.payment_id;
                pollPaymentStatus(paymentId);
            } else {
                alert('Failed to initiate payment. Please try again.');
                setSubmitting(false);
            }
        } catch (error) {
            console.error("Order/Payment failed:", error);
            alert("Failed to process order. Please try again.");
            setSubmitting(false);
        }
    };

    const pollPaymentStatus = async (paymentId) => {
        let attempts = 0;
        const maxAttempts = 30; // Poll for 1 minute (30 * 2 seconds)

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await api.get(`/payments/mpesa/status/${paymentId}/`);
                const status = response.data.status;

                if (status === 'succeeded') {
                    clearInterval(interval);
                    alert('Payment successful! Your order has been placed.');
                    navigate('/dashboard/my-orders');
                } else if (status === 'failed' || status === 'cancelled') {
                    clearInterval(interval);
                    alert('Payment failed or was cancelled. Please try again.');
                    setSubmitting(false);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    alert('Payment is taking longer than expected. Please check your orders page.');
                    navigate('/dashboard/my-orders');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 2000); // Check every 2 seconds
    };

    return (
        <div className="min-h-screen bg-gray-50/60 overflow-hidden font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements - Palestinian Flag Colors */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-red/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-black/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-green/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block py-1 px-3 rounded-full bg-black text-white text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Secure Checkout
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Order</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                        Every purchase supports the cause. Thank you for standing with Palestine.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Shipping & Payment Form */}
                    <div className="space-y-6">
                        {/* Shipping Information Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-red to-pink-600 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                                </div>
                                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            value={shippingInfo.fullName}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={shippingInfo.email}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (M-Pesa)</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            value={shippingInfo.phone}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                                            placeholder="254712345678"
                                            pattern="254[0-9]{9}"
                                            title="Please enter a valid Kenyan phone number (254XXXXXXXXX)"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Format: 254XXXXXXXXX (e.g., 254712345678)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            required
                                            value={shippingInfo.address}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            required
                                            value={shippingInfo.city}
                                            onChange={handleInputChange}
                                            className="block w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 transition-all"
                                            placeholder="Nairobi"
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Payment Method Card */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-emerald-600 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                                </div>
                                <div className="border-2 border-accent-green bg-green-50 p-5 rounded-2xl shadow-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <svg className="w-8 h-8 text-accent-green mr-3" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                                            </svg>
                                            <div>
                                                <span className="font-bold text-lg block">M-Pesa</span>
                                                <span className="text-sm text-gray-600">Mobile Money Payment</span>
                                            </div>
                                        </div>
                                        <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">SELECTED</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                                        <p className="text-sm text-gray-700">
                                            <strong>How it works:</strong> After clicking "Complete Order", you'll receive an STK Push on your phone.
                                            Enter your M-Pesa PIN to complete the payment.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="group relative sticky top-6">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700 to-black rounded-3xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                                </div>

                                <div className="flow-root mb-6">
                                    <ul className="-my-4 divide-y divide-gray-200">
                                        {cartItems.map((item) => (
                                            <li key={item.id} className="py-4 flex">
                                                <div className="flex-shrink-0 w-20 h-20 border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-100">
                                                    <img
                                                        src={item.image || '/placeholder-product.png'}
                                                        alt={item.name}
                                                        className="w-full h-full object-center object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between">
                                                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                        <p className="ml-4 font-bold text-gray-900">Ksh {item.price * item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">Qty {item.quantity}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t-2 border-gray-200 pt-6 space-y-3">
                                    <div className="flex justify-between text-base font-medium text-gray-700">
                                        <p>Subtotal</p>
                                        <p>Ksh {total}</p>
                                    </div>
                                    <div className="flex justify-between text-base font-medium text-gray-700">
                                        <p>Shipping</p>
                                        <p className="text-accent-green">Free</p>
                                    </div>
                                    <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t-2 border-gray-900">
                                        <p>Total</p>
                                        <p>Ksh {total}</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    disabled={submitting || loading}
                                    className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${submitting || loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-accent-red to-primary-600 hover:from-red-700 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                                        }`}
                                >
                                    {submitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing Payment...
                                        </span>
                                    ) : (
                                        'Complete Order with M-Pesa'
                                    )}
                                </button>

                                {/* Trust Badge */}
                                <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
                                    <svg className="w-5 h-5 text-accent-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Secure & Encrypted Payment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
