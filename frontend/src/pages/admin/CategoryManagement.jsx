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

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Category Management</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                    {showForm ? 'Cancel' : 'Add Category'}
                </button>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
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
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary">
                                {editingCategory ? 'Update' : 'Create'} Category
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
                            <th className="text-left p-3">Slug</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-left p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{category.name}</td>
                                <td className="p-3">{category.slug}</td>
                                <td className="p-3">{category.description || '-'}</td>
                                <td className="p-3">
                                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:underline mr-3">
                                        Edit
                                    </button>
                                    <button onClick={() => confirmDelete(category)} className="text-red-600 hover:underline">
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

export default CategoryManagement;

