import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

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
        image: null
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
            image: null
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
            image: null
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    if (loading) return <div className="p-6">Loading...</div>;

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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Store Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Product Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">SKU</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock</label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Product Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary">
                                {editingProduct ? 'Update' : 'Create'} Product
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">SKU</th>
                            <th className="text-left p-3">Price</th>
                            <th className="text-left p-3">Stock</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{product.name}</td>
                                <td className="p-3">{product.sku}</td>
                                <td className="p-3">Ksh {product.price}</td>
                                <td className="p-3">{product.stock}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:underline mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(product)}
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StoreManagement;

