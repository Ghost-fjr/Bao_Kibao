import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });
    const [modalOpen, setModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/store/categories/');
            setCategories(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setToast({ message: 'Failed to fetch categories', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/store/categories/${editingCategory.id}/`, formData);
                setToast({ message: 'Category updated successfully', type: 'success' });
            } else {
                await api.post('/store/categories/', formData);
                setToast({ message: 'Category created successfully', type: 'success' });
            }
            fetchCategories();
            resetForm();
        } catch (error) {
            console.error('Error saving category:', error);
            setToast({ message: 'Failed to save category', type: 'error' });
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || ''
        });
        setShowForm(true);
    };

    const confirmDelete = (category) => {
        setCategoryToDelete(category);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await api.delete(`/store/categories/${categoryToDelete.id}/`);
            setToast({ message: 'Category deleted successfully', type: 'success' });
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            setToast({ message: 'Failed to delete category', type: 'error' });
        } finally {
            setModalOpen(false);
            setCategoryToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', slug: '', description: '' });
        setEditingCategory(null);
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
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">Category Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-accent-black mb-6">{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/20 outline-none transition-all"
                                rows="3"
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="px-8 py-3 bg-accent-red text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all transform hover:-translate-y-1">
                                {editingCategory ? 'Update' : 'Create'} Category
                            </button>
                            <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Name</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Slug</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Description</th>
                                <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-900">{category.name}</td>
                                    <td className="p-6 text-gray-600">{category.slug}</td>
                                    <td className="p-6 text-gray-600">{category.description || '-'}</td>
                                    <td className="p-6">
                                        <div className="flex gap-3">
                                            <button onClick={() => handleEdit(category)} className="text-accent-black hover:text-accent-red font-medium transition-colors">
                                                Edit
                                            </button>
                                            <button onClick={() => confirmDelete(category)} className="text-red-400 hover:text-red-600 font-medium transition-colors">
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
        </div>
    );
};

export default CategoryManagement;

