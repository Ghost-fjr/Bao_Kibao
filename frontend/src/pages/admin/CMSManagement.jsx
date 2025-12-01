import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

const CMSManagement = () => {
    const [activeTab, setActiveTab] = useState('pages');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'pages': endpoint = '/cms/pages/'; break;
                case 'achievements': endpoint = '/cms/achievements/'; break;
                case 'gallery': endpoint = '/cms/gallery/'; break;
                default: return;
            }
            const response = await api.get(endpoint);
            setItems(response.data.results || response.data);
        } catch (error) {
            console.error('Error fetching items:', error);
            setToast({ message: 'Failed to fetch items', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'pages': endpoint = '/cms/pages/'; break;
                case 'achievements': endpoint = '/cms/achievements/'; break;
                case 'gallery': endpoint = '/cms/gallery/'; break;
                default: return;
            }

            const data = new FormData();
            // Common fields
            if (formData.title) data.append('title', formData.title);
            if (formData.description) data.append('description', formData.description);

            // Tab specific fields
            if (activeTab === 'pages') {
                data.append('slug', formData.slug);
                data.append('content', formData.content);
                data.append('is_published', formData.is_published);
            } else if (activeTab === 'achievements') {
                data.append('date', formData.date);
                if (formData.image) {
                    data.append('image', formData.image);
                }
            } else if (activeTab === 'gallery') {
                data.append('media_type', formData.media_type);
                if (formData.media_type === 'image' && formData.image) {
                    data.append('image', formData.image);
                }
                if (formData.media_type === 'video' && formData.video_url) {
                    data.append('video_url', formData.video_url);
                }
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' },
            };

            if (editingItem) {
                await api.put(`${endpoint}${editingItem.id}/`, data, config);
                setToast({ message: 'Item updated successfully', type: 'success' });
            } else {
                await api.post(endpoint, data, config);
                setToast({ message: 'Item created successfully', type: 'success' });
            }
            fetchItems();
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            setToast({ message: 'Failed to save item', type: 'error' });
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        let newFormData = {};
        if (activeTab === 'pages') {
            newFormData = {
                title: item.title,
                slug: item.slug,
                content: item.content,
                is_published: item.is_published
            };
        } else if (activeTab === 'achievements') {
            newFormData = {
                title: item.title,
                description: item.description,
                date: item.date,
                image: null
            };
        } else if (activeTab === 'gallery') {
            newFormData = {
                title: item.title,
                description: item.description,
                media_type: item.media_type,
                video_url: item.video_url || '',
                image: null
            };
        }
        setFormData(newFormData);
        setShowForm(true);
    };

    const confirmDelete = (item) => {
        setItemToDelete(item);
        setModalOpen(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'pages': endpoint = '/cms/pages/'; break;
                case 'achievements': endpoint = '/cms/achievements/'; break;
                case 'gallery': endpoint = '/cms/gallery/'; break;
                default: return;
            }
            await api.delete(`${endpoint}${itemToDelete.id}/`);
            setToast({ message: 'Item deleted successfully', type: 'success' });
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            setToast({ message: 'Failed to delete item', type: 'error' });
        } finally {
            setModalOpen(false);
            setItemToDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({});
        setEditingItem(null);
        setShowForm(false);
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'pages':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug || ''}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Content</label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="input-field"
                                rows="5"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published || false}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium">Published</span>
                            </label>
                        </div>
                    </>
                );
            case 'achievements':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="input-field"
                            />
                        </div>
                    </>
                );
            case 'gallery':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Media Type</label>
                            <select
                                value={formData.media_type || 'image'}
                                onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                                className="input-field"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        {formData.media_type === 'image' ? (
                            <div>
                                <label className="block text-sm font-medium mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    className="input-field"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium mb-1">Video URL</label>
                                <input
                                    type="url"
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="input-field"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

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
                title="Delete Item"
                message={`Are you sure you want to delete this item? This action cannot be undone.`}
            />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">CMS Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn-primary"
                >
                    {showForm ? 'Cancel' : 'Add Item'}
                </button>
            </div>

            <div className="mb-6 border-b">
                <nav className="-mb-px flex space-x-8">
                    {['pages', 'achievements', 'gallery'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setShowForm(false); }}
                            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {showForm && (
                <div className="card mb-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {renderForm()}
                        <div className="flex gap-2">
                            <button type="submit" className="btn-primary">
                                {editingItem ? 'Update' : 'Create'} Item
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                {loading ? (
                    <div className="p-6 text-center">Loading...</div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Title</th>
                                {activeTab === 'pages' && <th className="text-left p-3">Slug</th>}
                                {activeTab === 'achievements' && <th className="text-left p-3">Date</th>}
                                {activeTab === 'gallery' && <th className="text-left p-3">Type</th>}
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{item.title}</td>
                                    {activeTab === 'pages' && <td className="p-3">{item.slug}</td>}
                                    {activeTab === 'achievements' && <td className="p-3">{item.date}</td>}
                                    {activeTab === 'gallery' && <td className="p-3 capitalize">{item.media_type}</td>}
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:underline mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(item)}
                                            className="text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default CMSManagement;

