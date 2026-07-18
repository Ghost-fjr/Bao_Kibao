import React from 'react';
import BackgroundElements from './BackgroundElements';

const PageSkeleton = ({ type = 'default' }) => {
    if (type === 'grid') {
        return (
            <div className="bg-gradient-to-b from-gray-50 to-white relative min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto animate-pulse relative z-10">
                    <div className="text-center mb-16">
                        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                        <div className="h-12 bg-gray-200 rounded-2xl w-1/2 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-100 rounded w-full"></div>
                                        <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded-xl w-full mt-4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'dashboard') {
        return (
            <div className="p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 bg-gray-50 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'timeline') {
        return (
            <div className="bg-gradient-to-b from-gray-50 to-white relative min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-7xl mx-auto animate-pulse relative z-10">
                    <div className="text-center mb-20">
                        <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                        <div className="h-16 bg-gray-200 rounded-2xl w-1/2 mx-auto mb-6"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    </div>
                    <div className="relative space-y-12 md:space-y-24">
                        {/* Center line mock */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-100 hidden md:block"></div>
                        
                        {[1, 2, 3].map((i, index) => (
                            <div key={i} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white bg-gray-200 z-10 hidden md:block"></div>
                                <div className="w-full md:w-1/2 px-4 md:px-12">
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                                        <div className="h-64 bg-gray-200"></div>
                                        <div className="p-8 space-y-4">
                                            <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
                                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                            <div className="space-y-2 mt-4">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                                <div className="h-4 bg-gray-100 rounded w-5/6"></div>
                                                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default detailed view (like forms or detail pages)
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-200/50 to-transparent pointer-events-none"></div>
            <div className="max-w-4xl mx-auto relative z-10 animate-pulse">
                <div className="mb-10 text-center">
                    <div className="h-6 bg-gray-200 rounded-full w-40 mx-auto mb-4"></div>
                    <div className="h-12 bg-gray-200 rounded-2xl w-3/4 mx-auto mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded-xl w-1/2 mx-auto mb-6"></div>
                </div>
                
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                    <div className="h-16 bg-gray-50 border-b border-gray-100"></div>
                    <div className="p-8 space-y-8">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-32 bg-gray-100 rounded-xl w-full"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                            <div className="h-12 bg-gray-100 rounded-xl w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageSkeleton;
