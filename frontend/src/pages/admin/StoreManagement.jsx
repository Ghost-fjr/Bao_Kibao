import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

const StoreManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        price: '',
        stock: '',
        sku: '',
        is_active: true,
        image: null,
        sizes: []
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/store/products/');
            setProducts(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setToast({ message: 'Failed to fetch products', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/store/categories/');
            setCategories(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setToast({ message: 'Failed to fetch categories', type: 'error' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('stock', formData.stock);
            data.append('sku', formData.sku);
            data.append('is_active', formData.is_active);
            if (formData.image) {
                data.append('image', formData.image);
            }
            if (formData.sizes && formData.sizes.length > 0) {
                data.append('sizes', JSON.stringify(formData.sizes));
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingProduct) {
                await api.put(`/store/products/${editingProduct.id}/`, data, config);
                setToast({ message: 'Product updated successfully', type: 'success' });
            } else {
                await api.post('/store/products/', data, config);
                setToast({ message: 'Product created successfully', type: 'success' });
            }
            fetchProducts();
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            setToast({ message: 'Failed to save product', type: 'error' });
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            category: typeof product.category === 'object' ? product.category.id : product.category,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            is_active: product.is_active,
            image: null,
            sizes: product.sizes || []
        });
        setShowForm(true);
    };

    const confirmDelete = (product) => {
        setProductToDelete(product);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/store/products/${productToDelete.id}/`);
            setToast({ message: 'Product deleted successfully', type: 'success' });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            setToast({ message: 'Failed to delete product', type: 'error' });
        } finally {
            setModalOpen(false);
            setProductToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            price: '',
            stock: '',
            sku: '',
            is_active: true,
            image: null,
            sizes: []
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    if (loading) return <PageSkeleton type="dashboard" />;

    return (
        <div className="p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete the product "${productToDelete?.name}"? This action cannot be undone.`}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">Store Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-accent-black mb-6">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">SKU (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                    placeholder="Leave blank to auto-generate"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave blank to auto-generate.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500">Ksh</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-green focus:ring-2 focus:ring-accent-green/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-accent-green hover:file:bg-green-100"
                            />
                        </div>

                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 text-accent-green rounded focus:ring-accent-green border-gray-300"
                                />
                                <span className="text-sm font-bold text-gray-700">Active Product</span>
                            </label>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Product Sizes</h3>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        ...formData,
                                        sizes: [...formData.sizes, { size_name: '', stock: 0, price_adjustment: 0 }]
                                    })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors"
                                >
                                    + Add Size
                                </button>
                            </div>

                            {formData.sizes.map((size, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Size Name</label>
                                        <input
                                            type="text"
                                            value={size.size_name}
                                            onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[index].size_name = e.target.value;
                                                setFormData({ ...formData, sizes: newSizes });
                                            }}
                                            placeholder="e.g. S, M, XL"
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-green outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            value={size.stock}
                                            onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[index].stock = parseInt(e.target.value) || 0;
                                                setFormData({ ...formData, sizes: newSizes });
                                            }}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-green outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Price Adj.</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={size.price_adjustment}
                                            onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[index].price_adjustment = parseFloat(e.target.value) || 0;
                                                setFormData({ ...formData, sizes: newSizes });
                                            }}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-accent-green outline-none"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newSizes = formData.sizes.filter((_, i) => i !== index);
                                                setFormData({ ...formData, sizes: newSizes });
                                            }}
                                            className="w-full py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {formData.sizes.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center py-4">No sizes added. Product will use main stock.</p>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="px-8 py-3 bg-accent-green text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all transform hover:-translate-y-1">
                                {editingProduct ? 'Update' : 'Create'} Product
                            </button>
                            <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div >
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Name</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">SKU</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Price</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Stock</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Status</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-900">{product.name}</td>
                                    <td className="p-6 text-gray-600">{product.sku}</td>
                                    <td className="p-6 font-bold text-accent-green">Ksh {product.price}</td>
                                    <td className="p-6 text-gray-600">{product.stock}</td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-accent-black hover:text-accent-green font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(product)}
                                                className="text-red-400 hover:text-red-600 font-medium transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
};

export default StoreManagement;

