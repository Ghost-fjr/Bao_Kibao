import { useState, useEffect } from 'react';
import { cmsService } from '../../services/cms.js';

const GalleryPage = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const data = await cmsService.getGallery();
                setMediaItems(data.results || data);
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
        <div className="min-h-screen bg-gray-50/70 overflow-hidden font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-red/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-black/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

                {/* Palestinian Doodles */}
                {/* Hearts */}
                <svg className="absolute top-24 right-10 w-16 h-16 text-accent-red opacity-30 animate-bounce" style={{ animationDuration: '2.5s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <svg className="absolute bottom-1/3 left-20 w-18 h-18 text-accent-green opacity-25 animate-bounce" style={{ animationDuration: '3.5s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>

                {/* Palestinian Flags */}
                <svg className="absolute top-1/4 left-16 w-24 h-24 text-accent-red opacity-20 animate-pulse" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="currentColor" />
                    <rect x="0" y="40" width="100" height="20" fill="#00843D" />
                    <polygon points="0,0 0,60 40,30" fill="currentColor" opacity="0.8" />
                </svg>
                <svg className="absolute bottom-20 right-32 w-20 h-20 text-accent-green opacity-20" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="#E31E24" />
                    <rect x="0" y="40" width="100" height="20" fill="currentColor" />
                    <polygon points="0,0 0,60 40,30" fill="#E31E24" opacity="0.8" />
                </svg>

                {/* Stars */}
                <svg className="absolute top-1/2 right-1/4 w-14 h-14 text-accent-green opacity-20 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <svg className="absolute bottom-40 left-10 w-12 h-12 text-accent-red opacity-15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>

                {/* Palestinian Watermelons */}
                <svg className="absolute top-40 right-32 w-22 h-22 text-accent-red opacity-20" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="#00843D" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="currentColor" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="35" cy="45" r="2" fill="#000000" />
                    <circle cx="50" cy="50" r="2" fill="#000000" />
                    <circle cx="65" cy="45" r="2" fill="#000000" />
                </svg>
                <svg className="absolute bottom-10 left-1/2 w-20 h-20 text-accent-green opacity-25" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="currentColor" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="#E31E24" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="40" cy="45" r="1.5" fill="#000000" />
                    <circle cx="55" cy="48" r="1.5" fill="#000000" />
                </svg>

                {/* Palestine Map Outlines */}
                <svg className="absolute top-2/3 left-32 w-24 h-28 text-accent-black opacity-15" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <svg className="absolute top-20 right-1/3 w-20 h-24 text-accent-green opacity-20" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="currentColor" opacity="0.3" />
                </svg>
            </div>

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

                {mediaItems.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Media Yet</h3>
                        <p className="text-gray-500">Our gallery is being curated. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mediaItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer border border-gray-100"
                                onClick={() => setSelectedImage(item)}
                            >
                                <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                                <img
                                    src={item.file || item.image}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8">
                                    <h3 className="text-white font-bold text-xl mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-gray-300 text-sm line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">{item.description}</p>
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
                            src={selectedImage.file || selectedImage.image}
                            alt={selectedImage.title}
                            className="w-full h-full object-contain max-h-[85vh]"
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
                            <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                            {selectedImage.description && <p className="text-gray-300">{selectedImage.description}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;

