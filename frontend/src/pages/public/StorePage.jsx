import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../../services/store.js';
import api from '../../services/api';
import Toast from '../../components/common/Toast';
import BackgroundElements from '../../components/common/BackgroundElements';

const StorePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});

    // Product modal state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    storeService.getProducts(),
                    api.get('/store/categories/').then(res => res.data.results || res.data)
                ]);
                setProducts(productsData.results || productsData);
                setCategories(categoriesData);

                // Initialize all categories as expanded
                const expanded = {};
                categoriesData.forEach(cat => {
                    expanded[cat.id] = true;
                });
                expanded['uncategorized'] = true;
                setExpandedCategories(expanded);
            } catch (err) {
                setError('Failed to load store data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const openProductModal = (product) => {
        setSelectedProduct(product);
        setSelectedSize(null);
        setQuantity(1);
    };

    const closeProductModal = () => {
        setSelectedProduct(null);
        setSelectedSize(null);
        setQuantity(1);
    };

    const handleAddToCart = async () => {
        // Validate size selection if product has sizes
        if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
            setToast({ message: 'Please select a size', type: 'error' });
            return;
        }

        setAddingToCart(true);
        try {
            await storeService.addToCart(selectedProduct.id, quantity, selectedSize?.id);
            setToast({ message: `${selectedProduct.name} added to cart!`, type: 'success' });
            closeProductModal();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                setToast({ message: 'Please login to add items to cart', type: 'error' });
            } else {
                setToast({ message: 'Failed to add to cart. Please try again.', type: 'error' });
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const handleQuickAdd = async (product) => {
        // If product has sizes, open modal; otherwise add directly
        if (product.sizes && product.sizes.length > 0) {
            openProductModal(product);
        } else {
            try {
                await storeService.addToCart(product.id, 1);
                setToast({ message: `${product.name} added to cart!`, type: 'success' });
            } catch (err) {
                console.error(err);
                if (err.response?.status === 401) {
                    setToast({ message: 'Please login to add items to cart', type: 'error' });
                } else {
                    setToast({ message: 'Failed to add to cart. Please try again.', type: 'error' });
                }
            }
        }
    };

    // Calculate displayed price based on selected size
    const getDisplayPrice = () => {
        if (!selectedProduct) return 0;
        if (selectedSize) {
            return parseFloat(selectedProduct.price) + parseFloat(selectedSize.price_adjustment || 0);
        }
        return parseFloat(selectedProduct.price);
    };

    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
        const catId = product.category || 'uncategorized';
        if (!productsByCategory[catId]) {
            productsByCategory[catId] = [];
        }
        productsByCategory[catId].push(product);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="relative w-24 h-24">
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-4 border-primary-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
            </div>
        );
    }

    // Product card component
    const ProductCard = ({ product }) => (
        <div className="min-w-[280px] md:min-w-[320px] snap-center group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col">
            <div className="h-64 bg-gray-100 relative overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={() => product.sizes && product.sizes.length > 0 ? openProductModal(product) : handleQuickAdd(product)}
                        className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {product.sizes && product.sizes.length > 0 ? 'Select Options' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                    <h3
                        className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors cursor-pointer"
                        onClick={() => openProductModal(product)}
                    >
                        {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">{product.description || 'Premium quality merchandise supporting the cause.'}</p>

                    {/* Sizes Display */}
                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Available Sizes</p>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map(size => (
                                    <span
                                        key={size.id}
                                        className={`px-2 py-1 rounded text-xs font-medium ${size.in_stock ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400 line-through'}`}
                                    >
                                        {size.size_name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-black text-gray-900">Ksh {product.price}</span>
                    <button
                        onClick={() => openProductModal(product)}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                    >
                        View
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gradient-to-b from-accent-black/60 via-accent-red/40 to-accent-green/50 relative overflow-hidden min-h-screen font-sans selection:bg-accent-red selection:text-white pb-20">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Background Elements */}
            <BackgroundElements />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="flex flex-col md:flex-row justify-between items-center mb-16">
                    <div className="text-center md:text-left mb-8 md:mb-0">
                        <span className="inline-block py-1 px-3 rounded-full bg-black text-white text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                            Wear the Cause
                        </span>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                            Official <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Merch</span>
                        </h1>
                    </div>
                    <Link to="/store/checkout" className="group relative px-8 py-4 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent-red to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            View Cart / Checkout
                        </span>
                    </Link>
                </div>

                {error ? (
                    <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-3xl border border-red-100 shadow-xl">
                        <h2 className="text-2xl font-bold text-accent-red mb-4">{error}</h2>
                        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-accent-red text-white rounded-full hover:bg-red-700 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Store Opening Soon</h3>
                        <p className="text-gray-500 mb-8">We're stocking up on high-quality merchandise. Stay tuned!</p>
                        <Link to="/" className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all shadow-lg">
                            Return Home
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Render categories */}
                        {categories.map(category => {
                            const categoryProducts = productsByCategory[category.id];
                            if (!categoryProducts || categoryProducts.length === 0) return null;

                            return (
                                <div key={category.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {category.image && (
                                                <img src={category.image} alt={category.name} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                            )}
                                            <div className="text-left">
                                                <h2 className="text-2xl font-black text-gray-900">{category.name}</h2>
                                                {category.description && <p className="text-gray-500 text-sm">{category.description}</p>}
                                            </div>
                                        </div>
                                        <svg
                                            className={`w-6 h-6 transform transition-transform duration-300 ${expandedCategories[category.id] ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {expandedCategories[category.id] && (
                                        <div className="p-8">
                                            <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
                                                {categoryProducts.map((product) => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Uncategorized Products */}
                        {productsByCategory['uncategorized'] && productsByCategory['uncategorized'].length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                                <button
                                    onClick={() => toggleCategory('uncategorized')}
                                    className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <h2 className="text-2xl font-black text-gray-900">Other Items</h2>
                                    </div>
                                    <svg
                                        className={`w-6 h-6 transform transition-transform duration-300 ${expandedCategories['uncategorized'] ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {expandedCategories['uncategorized'] && (
                                    <div className="p-8">
                                        <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
                                            {productsByCategory['uncategorized'].map((product) => (
                                                <ProductCard key={product.id} product={product} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={closeProductModal}
                >
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeProductModal}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Product Image */}
                        <div className="h-64 md:h-80 bg-gray-100 relative overflow-hidden rounded-t-3xl">
                            {selectedProduct.image ? (
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                    <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="p-8">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">{selectedProduct.name}</h2>
                            <p className="text-gray-600 mb-6">{selectedProduct.description || 'Premium quality merchandise supporting the cause.'}</p>

                            {/* Size Selection */}
                            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">
                                        Select Size <span className="text-accent-red">*</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {selectedProduct.sizes.map(size => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size)}
                                                disabled={!size.in_stock}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedSize?.id === size.id
                                                        ? 'bg-gray-900 text-white shadow-lg'
                                                        : size.in_stock
                                                            ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                            : 'bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                                                    }`}
                                            >
                                                {size.size_name}
                                                {size.price_adjustment > 0 && (
                                                    <span className="text-xs ml-1">(+Ksh {size.price_adjustment})</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedSize && (
                                        <p className="text-accent-red text-sm mt-2">Please select a size</p>
                                    )}
                                </div>
                            )}

                            {/* Quantity Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                        </svg>
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                                        className="w-20 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-0"
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                        className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Price and Add to Cart */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-500">Total Price</p>
                                    <p className="text-3xl font-black text-gray-900">
                                        Ksh {(getDisplayPrice() * quantity).toFixed(2)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || (selectedProduct.sizes?.length > 0 && !selectedSize)}
                                    className={`px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 ${addingToCart || (selectedProduct.sizes?.length > 0 && !selectedSize)
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-accent-red to-primary-600 text-white hover:shadow-xl transform hover:-translate-y-1'
                                        }`}
                                >
                                    {addingToCart ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorePage;
