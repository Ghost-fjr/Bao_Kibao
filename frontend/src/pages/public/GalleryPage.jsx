import { useState, useEffect } from 'react';
import { cmsService } from '../../services/cms.js';
import BackgroundElements from '../../components/common/BackgroundElements';

const GalleryPage = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [expandedCollection, setExpandedCollection] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await cmsService.getGalleryCollections();
                setCollections(data.results || data);
            } catch (err) {
                console.error('Failed to load gallery:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

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

    return (
        <div className="bg-gradient-to-b from-accent-white/80 via-accent-green/50 to-accent-red/60 relative overflow-hidden min-h-screen font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <BackgroundElements />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-green-50 text-accent-green text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Moments of Impact
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-600">Gallery</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                        Capturing the spirit of solidarity, resilience, and the beautiful game.
                    </p>
                </div>

                {collections.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Collections Yet</h3>
                        <p className="text-gray-500">Our gallery is being curated. Check back soon!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {collections.map((collection) => (
                            <div key={collection.id} className="group relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-emerald-600 rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20">
                                    {/* Collection Header */}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-black text-gray-900">{collection.title}</h2>
                                                <span className="px-3 py-1 bg-green-100 text-accent-green rounded-full text-sm font-bold">
                                                    {collection.media_count} {collection.media_count === 1 ? 'photo' : 'photos'}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-2">{collection.description}</p>
                                            <p className="text-sm text-gray-500">
                                                📅 {new Date(collection.event_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        {collection.cover_image && (
                                            <img
                                                src={collection.cover_image}
                                                alt={collection.title}
                                                className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-200"
                                            />
                                        )}
                                    </div>

                                    {/* Media Grid */}
                                    {collection.media_items && collection.media_items.length > 0 && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {collection.media_items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="group/item relative aspect-square bg-gray-200 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                    onClick={() => setSelectedImage(item)}
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.title}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                                        <h3 className="text-white font-bold text-sm translate-y-2 group-hover/item:translate-y-0 transition-transform duration-300">
                                                            {item.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 transition-opacity duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div
                        className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage.image}
                            alt={selectedImage.title}
                            className="w-full h-full object-contain max-h-[85vh]"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
                            <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                            {selectedImage.caption && <p className="text-gray-300">{selectedImage.caption}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
