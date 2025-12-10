import { Link } from 'react-router-dom';

const DonatePage = () => {
    const donationTiers = [
        {
            amount: 1000,
            title: "Supporter",
            description: "Help fund essential supplies for Gaza relief",
            icon: "🤝",
            gradient: "from-accent-green to-emerald-600"
        },
        {
            amount: 5000,
            title: "Champion",
            description: "Sponsor a full tournament for the cause",
            icon: "⚽",
            gradient: "from-accent-red to-pink-600",
            featured: true
        },
        {
            amount: 10000,
            title: "Hero",
            description: "Make a significant impact on our mission",
            icon: "❤️",
            gradient: "from-gray-700 to-black"
        }
    ];

    const impactAreas = [
        {
            icon: "🏴",
            title: "Direct Gaza Relief",
            description: "100% of profits go to verified organizations supporting Gaza"
        },
        {
            title: "Community Tournaments",
            description: "Organize events that unite and raise awareness"
        },
        {
            icon: "📚",
            title: "Education & Awareness",
            description: "Promote conscious living and ethical consumption"
        },
        {
            icon: "👕",
            title: "Merchandise for Change",
            description: "Every purchase supports the Palestinian cause"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/60 overflow-hidden font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements - Palestinian Flag Colors */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-red/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-black/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-green/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-red-50 text-accent-red text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Stand with Palestine
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Support Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Mission</span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-xl text-gray-600 font-light leading-relaxed">
                        Every contribution helps us raise awareness, support Gaza relief efforts, and unite communities through the beautiful game. Your generosity makes a real difference.
                    </p>
                </div>

                {/* Donation Tiers */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {donationTiers.map((tier, index) => (
                        <div key={index} className={`group relative ${tier.featured ? 'md:-mt-4' : ''}`}>
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${tier.gradient} rounded-3xl opacity-${tier.featured ? '40' : '20'} group-hover:opacity-50 transition duration-500 blur`}></div>
                            <div className={`relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 ${tier.featured ? 'ring-2 ring-accent-red' : ''}`}>
                                {tier.featured && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-accent-red text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                                    {tier.icon}
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-gray-900 mb-2">Ksh {tier.amount.toLocaleString()}</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{tier.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{tier.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Impact Areas */}
                <div className="group relative mb-16">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-emerald-600 rounded-3xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-xl border border-white/20">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Your Donation Helps</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {impactAreas.map((area, index) => (
                                <div key={index} className="flex items-start p-6 bg-gray-50 rounded-2xl hover:bg-white transition-colors">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-green to-emerald-600 rounded-xl flex items-center justify-center text-2xl mr-4">
                                        {area.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{area.title}</h3>
                                        <p className="text-gray-600">{area.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-red via-accent-black to-accent-green rounded-3xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-accent-red to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                            Join the Bao Kibao family and support Palestine through action. Every contribution counts.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-block px-10 py-4 bg-gradient-to-r from-accent-red to-primary-600 hover:from-red-700 hover:to-primary-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                Create Account to Donate
                            </Link>
                            <Link
                                to="/store"
                                className="inline-block px-10 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300 transition-all transform hover:-translate-y-1"
                            >
                                Shop Merchandise
                            </Link>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">Registration required for donation tracking and transparency</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonatePage;

