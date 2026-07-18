import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';
import PageSkeleton from '../../components/common/PageSkeleton';

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
    // Gallery collection state
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
                case 'collections': endpoint = '/cms/gallery-collections/'; break;
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
                case 'collections': endpoint = '/cms/gallery-collections/'; break;
                default: return;
            }

            const data = new FormData();

            // Tab specific fields
            if (activeTab === 'pages') {
                data.append('title', formData.title);
                data.append('content', formData.content);
                data.append('is_published', formData.is_published || false);
            } else if (activeTab === 'achievements') {
                data.append('title', formData.title);
                data.append('description', formData.description);
                data.append('date', formData.date);
                if (formData.image) {
                    data.append('image', formData.image);
                }
            } else if (activeTab === 'gallery') {
                data.append('title', formData.title || '');
                data.append('description', formData.description || '');
                data.append('media_type', formData.media_type);
                if (formData.media_type === 'image' && formData.image) {
                    data.append('image', formData.image);
                }
                if (formData.media_type === 'video' && formData.video_url) {
                    data.append('video_url', formData.video_url);
                }
            } else if (activeTab === 'collections') {
                data.append('name', formData.name);
                data.append('description', formData.description || '');
                data.append('event_date', formData.event_date || '');
                data.append('is_published', formData.is_published || false);
                if (formData.cover_image) {
                    data.append('cover_image', formData.cover_image);
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

    // Handle uploading photos to a collection
    const handleUploadPhotos = async (collectionId, files) => {
        if (!files || files.length === 0) return;

        setUploadingPhotos(true);
        try {
            for (let file of files) {
                const data = new FormData();
                data.append('collection', collectionId);
                data.append('media_type', 'image');
                data.append('image', file);
                data.append('title', file.name);
                await api.post('/cms/gallery/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setToast({ message: `Uploaded ${files.length} photos`, type: 'success' });
            fetchItems();
        } catch (error) {
            console.error('Error uploading photos:', error);
            setToast({ message: 'Failed to upload photos', type: 'error' });
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        let newFormData = {};
        if (activeTab === 'pages') {
            newFormData = {
                title: item.title,
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
        } else if (activeTab === 'collections') {
            newFormData = {
                name: item.name,
                description: item.description,
                event_date: item.event_date ? item.event_date.split('T')[0] : '',
                is_published: item.is_published,
                cover_image: null
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
                case 'collections': endpoint = '/cms/gallery-collections/'; break;
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

    const togglePublish = async (item) => {
        try {
            await api.patch(`/cms/gallery-collections/${item.id}/`, {
                is_published: !item.is_published
            });
            setToast({ message: `Collection ${item.is_published ? 'unpublished' : 'published'}`, type: 'success' });
            fetchItems();
        } catch (error) {
            setToast({ message: 'Failed to update', type: 'error' });
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
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
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
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                />
                            </div>
                        </div>
                    </>
                );
            case 'gallery':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Media Type *</label>
                                <select
                                    value={formData.media_type || 'image'}
                                    onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="2"
                            />
                        </div>
                        {formData.media_type === 'image' ? (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Image *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Video URL *</label>
                                <input
                                    type="url"
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        )}
                    </>
                );
            case 'collections':
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Collection Name *</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                    placeholder="e.g., Beach Tournament 2024"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Date</label>
                                <input
                                    type="date"
                                    value={formData.event_date || ''}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-accent-black focus:ring-2 focus:ring-accent-black/20 outline-none transition-all"
                                rows="2"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.files[0] })}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center space-x-3 cursor-pointer pb-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published || false}
                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        className="w-5 h-5 text-accent-green rounded focus:ring-accent-green border-gray-300"
                                    />
                                    <span className="text-sm font-bold text-gray-700">Published</span>
                                </label>
                            </div>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    const renderCollectionCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((collection) => (
                <div key={collection.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="h-40 bg-gray-100 relative">
                        {collection.cover_image ? (
                            <img src={collection.cover_image} alt={collection.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${collection.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {collection.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900">{collection.name}</h3>
                        {collection.event_date && (
                            <p className="text-sm text-gray-500">📅 {new Date(collection.event_date).toLocaleDateString()}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">{collection.media_items?.length || 0} photos</p>

                        {/* File upload for adding photos */}
                        <div className="mt-3">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleUploadPhotos(collection.id, Array.from(e.target.files))}
                                className="hidden"
                                id={`upload-${collection.id}`}
                                disabled={uploadingPhotos}
                            />
                            <label
                                htmlFor={`upload-${collection.id}`}
                                className="block w-full text-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                            >
                                {uploadingPhotos ? 'Uploading...' : '+ Add Photos'}
                            </label>
                        </div>

                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => togglePublish(collection)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${collection.is_published ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}
                            >
                                {collection.is_published ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                                onClick={() => handleEdit(collection)}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => confirmDelete(collection)}
                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTable = () => (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Title</th>
                            {activeTab === 'pages' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Status</th>}
                            {activeTab === 'achievements' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Date</th>}
                            {activeTab === 'gallery' && <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Type</th>}
                            <th className="text-left p-6 font-bold text-gray-600 uppercase tracking-wider text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6 font-medium text-gray-900">{item.title}</td>
                                {activeTab === 'pages' && (
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                )}
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
        </div>
    );

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
                <h1 className="text-3xl font-black text-accent-black tracking-tight">Content Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-accent-black text-white rounded-xl font-bold shadow-lg hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {showForm ? 'Cancel' : 'Add New'}
                </button>
            </div>

            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    {[
                        { key: 'pages', label: 'Pages' },
                        { key: 'achievements', label: 'Achievements' },
                        { key: 'collections', label: 'Gallery Collections' },
                        { key: 'gallery', label: 'Media Items' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setShowForm(false); }}
                            className={`whitespace-nowrap pb-4 px-1 border-b-4 font-bold text-sm transition-all ${activeTab === tab.key
                                ? 'border-accent-red text-accent-red'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label}
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
                                {editingItem ? 'Update' : 'Create'}
                            </button>
                            <button type="button" onClick={resetForm} className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <PageSkeleton type="dashboard" />
            ) : activeTab === 'collections' ? (
                items.length > 0 ? renderCollectionCards() : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <p className="text-gray-500 mb-4">No collections yet</p>
                        <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-accent-red text-white rounded-xl font-bold">
                            Create Collection
                        </button>
                    </div>
                )
            ) : (
                items.length > 0 ? renderTable() : (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <p className="text-gray-500">No items found</p>
                    </div>
                )
            )}
        </div>
    );
};

export default CMSManagement;
