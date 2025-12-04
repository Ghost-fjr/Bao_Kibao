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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug || ''}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="5"
                                required
                            />
                        </div>
                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published || false}
                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                    className="w-5 h-5 text-accent-black rounded focus:ring-accent-black border-gray-300"
                                />
                                <span className="text-sm font-bold text-gray-700">Published</span>
                            </label>
                        </div>
                    </>
                );
            case 'achievements':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="3"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={formData.date || ''}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-accent-black hover:file:bg-gray-200"
                            />
                        </div>
                    </>
                );
            case 'gallery':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Media Type</label>
                            <select
                                value={formData.media_type || 'image'}
                                onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        {formData.media_type === 'image' ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-accent-black hover:file:bg-gray-200"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Video URL</label>
                                <input
                                    type="url"
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
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

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black text-accent-black tracking-tight">CMS Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancel' : 'Add Item'}
                </button>
            </div>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['pages', 'achievements', 'gallery'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setShowForm(false); }}
                            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm capitalize transition-all ${activeTab === tab
                                ? 'border-accent-red text-accent-red'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 animate-fade-in-up">
                    <h2 className="text-xl font-bold text-accent-black mb-6">{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderForm()}
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="px-8 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1">
                                {editingItem ? 'Update' : 'Create'} Item
                            </button>
                            <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Title</th>
                                    {activeTab === 'pages' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Slug</th>}
                                    {activeTab === 'achievements' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Date</th>}
                                    {activeTab === 'gallery' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Type</th>}
                                    <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-6 font-medium text-gray-900">{item.title}</td>
                                        {activeTab === 'pages' && <td className="p-6 text-gray-600">{item.slug}</td>}
                                        {activeTab === 'achievements' && <td className="p-6 text-gray-600">{item.date}</td>}
                                        {activeTab === 'gallery' && <td className="p-6 capitalize text-gray-600">{item.media_type}</td>}
                                        <td className="p-6">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-accent-black hover:text-accent-red font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(item)}
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
                )}
            </div>
        </div>
    );
};

export default CMSManagement;

