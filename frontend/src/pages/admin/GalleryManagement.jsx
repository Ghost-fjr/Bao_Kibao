import { useState, useEffect } from 'react';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import Toast from '../../components/common/Toast';

const GalleryManagement = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ show: false, item: null });
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        is_published: true
    });
    const [coverImage, setCoverImage] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            const response = await api.get('/cms/gallery-collections/');
            setCollections(response.data.results || response.data);
        } catch (error) {
            setToast({ message: 'Failed to load collections', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('event_date', formData.event_date);
            data.append('is_published', formData.is_published);
            if (coverImage) {
                data.append('cover_image', coverImage);
            }

            let collectionId;
            if (editingCollection) {
                const response = await api.patch(`/cms/gallery-collections/${editingCollection.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                collectionId = response.data.id;
                setToast({ message: 'Collection updated successfully', type: 'success' });
            } else {
                const response = await api.post('/cms/gallery-collections/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                collectionId = response.data.id;
                setToast({ message: 'Collection created successfully', type: 'success' });
            }

            // Upload media files if any
            if (mediaFiles.length > 0) {
                for (const file of mediaFiles) {
                    const mediaData = new FormData();
                    mediaData.append('collection', collectionId);
                    mediaData.append('title', file.name.replace(/\.[^/.]+$/, ''));
                    mediaData.append('image', file);
                    mediaData.append('media_type', 'image');
                    await api.post('/cms/gallery/', mediaData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            resetForm();
            fetchCollections();
        } catch (error) {
            setToast({ message: 'Failed to save collection', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (collection) => {
        setEditingCollection(collection);
        setFormData({
            title: collection.title,
            description: collection.description || '',
            event_date: collection.event_date,
            is_published: collection.is_published
        });
        setCoverImage(null);
        setMediaFiles([]);
        setShowForm(true);
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/cms/gallery-collections/${deleteModal.item.id}/`);
            setToast({ message: 'Collection deleted successfully', type: 'success' });
            fetchCollections();
        } catch (error) {
            setToast({ message: 'Failed to delete collection', type: 'error' });
        } finally {
            setDeleteModal({ show: false, item: null });
        }
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', event_date: '', is_published: true });
        setCoverImage(null);
        setMediaFiles([]);
        setEditingCollection(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {deleteModal.show && (
                <ConfirmationModal
                    title="Delete Collection"
                    message={`Are you sure you want to delete "${deleteModal.item?.title}"? All media in this collection will also be deleted.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteModal({ show: false, item: null })}
                />
            )}

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-gray-900">Gallery Collections</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="px-6 py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Collection
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6">{editingCollection ? 'Edit Collection' : 'Create Collection'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-red focus:ring-0"
                                    placeholder="e.g., Championship Finals 2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-red focus:ring-0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-red focus:ring-0"
                                placeholder="Describe the event..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setCoverImage(e.target.files[0])}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-red focus:ring-0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Add Photos (Multiple)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => setMediaFiles(Array.from(e.target.files))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent-red focus:ring-0"
                                />
                                {mediaFiles.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">{mediaFiles.length} file(s) selected</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_published"
                                checked={formData.is_published}
                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                className="w-5 h-5 text-accent-red rounded focus:ring-accent-red"
                            />
                            <label htmlFor="is_published" className="font-medium text-gray-700">Publish collection</label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : (editingCollection ? 'Update Collection' : 'Create Collection')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Collections List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <div key={collection.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                        <div className="h-40 bg-gray-200 relative">
                            {collection.cover_image ? (
                                <img src={collection.cover_image} alt={collection.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-red/20 to-accent-green/20">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${collection.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {collection.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{collection.title}</h3>
                            <p className="text-sm text-gray-500 mb-3">📅 {new Date(collection.event_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{collection.description || 'No description'}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">{collection.media_count || 0} photos</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(collection)}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setDeleteModal({ show: true, item: collection })}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {collections.length === 0 && !showForm && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Collections Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first gallery collection to get started</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-6 py-3 bg-accent-red text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                    >
                        Create Collection
                    </button>
                </div>
            )}
        </div>
    );
};

export default GalleryManagement;
