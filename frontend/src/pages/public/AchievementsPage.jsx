import { useState, useEffect } from 'react';
import { cmsService } from '../../services/cms.js';
import BackgroundElements from '../../components/common/BackgroundElements';
import PageSkeleton from '../../components/common/PageSkeleton';

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const data = await cmsService.getAchievements();
                setAchievements(data.results || data);
            } catch (err) {
                console.error('Failed to load achievements:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    if (loading) return <PageSkeleton type="timeline" />;

    return (
        <div className="bg-gradient-to-b from-accent-green/70 via-accent-white/30 to-accent-black/70 relative overflow-hidden min-h-screen font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements */}
            <BackgroundElements />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="text-center mb-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Our Journey
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Milestones & <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-black">Impact</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                        Celebrating the victories, big and small, that bring us closer to a free Palestine.
                    </p>
                </div>

                {achievements.length === 0 ? (
                    <div className="text-center py-20 bg-white/60 backdrop-blur-md rounded-3xl shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Milestones Yet</h3>
                        <p className="text-gray-500">We're just getting started. Watch this space!</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-accent-red via-black to-accent-green rounded-full opacity-20 hidden md:block"></div>

                        <div className="space-y-12 md:space-y-24">
                            {achievements.map((achievement, index) => (
                                <div key={achievement.id} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    {/* Timeline Dot */}
                                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white bg-accent-red shadow-lg z-10 hidden md:block"></div>

                                    {/* Content Card */}
                                    <div className="w-full md:w-1/2 px-4 md:px-12">
                                        <div className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden">
                                            {achievement.image && (
                                                <div className="h-64 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300 z-10"></div>
                                                    <img
                                                        src={achievement.image}
                                                        alt={achievement.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-8">
                                                <div className="flex items-center mb-4">
                                                    <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold uppercase rounded-full tracking-wider">
                                                        {achievement.date ? new Date(achievement.date).getFullYear() : '2024'}
                                                    </span>
                                                    <span className="ml-3 text-sm text-gray-500 font-medium">
                                                        {achievement.date ? new Date(achievement.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : ''}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-accent-red transition-colors">{achievement.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{achievement.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spacer for timeline alignment */}
                                    <div className="w-full md:w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default AchievementsPage;

