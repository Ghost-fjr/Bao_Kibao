import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="bg-gradient-to-b from-accent-red/70 via-accent-black/70 to-accent-green/70 relative overflow-hidden min-h-screen">
            {/* Palestinian Doodles Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Bouncing Hearts */}
                <svg className="absolute top-20 right-20 w-16 h-16 text-accent-red opacity-30 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <svg className="absolute bottom-1/3 left-16 w-20 h-20 text-accent-green opacity-25 animate-bounce" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>

                {/* Special Tricolor Flag Heart - Gigantic & Aesthetic */}
                <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-bounce opacity-10" style={{ animationDuration: '10s' }} viewBox="0 0 100 100">
                    <defs>
                        <clipPath id="heart-clip">
                            <path d="M50 90 C10 70 0 40 0 25 C0 10 15 0 35 0 C45 0 50 10 50 10 C50 10 55 0 65 0 C85 0 100 10 100 25 C100 40 90 70 50 90 Z" />
                        </clipPath>
                    </defs>
                    <g clipPath="url(#heart-clip)">
                        <rect width="100" height="33" y="0" fill="#000000" />
                        <rect width="100" height="34" y="33" fill="#FFFFFF" />
                        <rect width="100" height="33" y="67" fill="#00843D" />
                        <path d="M0 0 L50 50 L0 100 Z" fill="#E31E24" />
                    </g>
                </svg>

                {/* Palestinian Flags */}
                <svg className="absolute top-40 left-10 w-24 h-24 text-accent-red opacity-20" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="currentColor" />
                    <rect x="0" y="40" width="100" height="20" fill="#00843D" />
                    <polygon points="0,0 0,60 40,30" fill="currentColor" opacity="0.8" />
                </svg>
                <svg className="absolute bottom-20 right-32 w-20 h-20 text-accent-green opacity-20 animate-pulse" viewBox="0 0 100 60">
                    <rect x="0" y="0" width="100" height="20" fill="#000000" />
                    <rect x="0" y="20" width="100" height="20" fill="#E31E24" />
                    <rect x="0" y="40" width="100" height="20" fill="currentColor" />
                    <polygon points="0,0 0,60 40,30" fill="#E31E24" opacity="0.8" />
                </svg>

                {/* Stars */}
                <svg className="absolute top-1/3 right-40 w-14 h-14 text-accent-red opacity-20 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <svg className="absolute bottom-1/4 left-1/3 w-12 h-12 text-accent-green opacity-15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>

                {/* Palestinian Watermelons */}
                <svg className="absolute top-1/2 right-12 w-22 h-22 text-accent-red opacity-20" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="#00843D" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="currentColor" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="35" cy="45" r="2" fill="#000000" />
                    <circle cx="50" cy="50" r="2" fill="#000000" />
                    <circle cx="65" cy="45" r="2" fill="#000000" />
                </svg>
                <svg className="absolute bottom-40 left-20 w-20 h-20 text-accent-green opacity-25" viewBox="0 0 100 100">
                    <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="currentColor" />
                    <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="#E31E24" />
                    <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                    <circle cx="40" cy="45" r="1.5" fill="#000000" />
                    <circle cx="55" cy="48" r="1.5" fill="#000000" />
                </svg>

                {/* Palestine Map Outlines */}
                <svg className="absolute top-1/2 right-10 w-28 h-32 text-accent-black opacity-15" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
                <svg className="absolute top-1/3 left-24 w-24 h-28 text-accent-green opacity-20" viewBox="0 0 100 120">
                    <path d="M50 10 L55 15 L60 20 L65 30 L68 40 L70 50 L70 60 L68 70 L65 80 L60 90 L55 100 L50 110 L45 105 L40 95 L35 85 L32 75 L30 65 L30 55 L32 45 L35 35 L40 25 L45 15 Z" fill="currentColor" opacity="0.3" />
                </svg>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-white via-gray-50 to-accent-red/70">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
                                    Bao <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Kibao.</span><br />
                                    Football for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-600">Humanity.</span>
                                </h1>
                                <p className="mt-6 text-xl md:text-2xl text-gray-600 leading-relaxed font-light sm:max-w-xl sm:mx-auto md:mt-8 lg:mx-0">
                                    Using the power of football to unite communities, raise awareness, and support Gaza through tournaments and merchandise.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <Link to="/tournaments" className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1">
                                        Join Tournaments
                                    </Link>
                                    <Link to="/store" className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all transform hover:-translate-y-1">
                                        Shop for Gaza
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <img
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1335&q=80"
                        alt="Football match"
                    />
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="relative z-10 py-16 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                            Est. 2024
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
                            Kick for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Gaza.</span><br />
                            Stand for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-600">Humanity.</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                            Bao Kibao is a movement. We unite communities through the beautiful game, raising voices and funds for those who need it most.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-red to-pink-600 rounded-3xl opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
                            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To inspire tangible change through football tournaments, educational drives, and awareness campaigns. We promote conscious living by boycotting brands that fund oppression and choosing products that support humanity.
                                </p>
                            </div>
                        </div>

                        {/* Vision */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-emerald-600 rounded-3xl opacity-30 group-hover:opacity-100 transition duration-500 blur"></div>
                            <div className="relative h-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-4xl font-bold text-gray-900 mb-6">Our Vision</h3>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    To build a united community where every match, jersey, and voice becomes a call for freedom and justice in Gaza — now and always.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* What We Do Section */}
            <div className="relative z-10 py-24 bg-gradient-to-r from-accent-green/70 via-white to-accent-black/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">What We Do</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-accent-red via-black to-accent-green mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: 'Football for a Cause',
                                desc: '7-a-side tournaments uniting youth for a purpose.',
                                gradient: 'from-orange-400 to-pink-600',
                                icon: '⚽'
                            },
                            {
                                title: 'Merch for Palestine',
                                desc: '100% of profits go directly to Gaza relief efforts.',
                                gradient: 'from-green-400 to-emerald-600',
                                icon: '🏴'
                            },
                            {
                                title: 'Boycott Awareness',
                                desc: 'Educating on ethical consumption and resistance.',
                                gradient: 'from-gray-700 to-black',
                                icon: '🚫'
                            },
                            {
                                title: 'Community Engagement',
                                desc: 'Empowering local youth through solidarity.',
                                gradient: 'from-blue-400 to-indigo-600',
                                icon: '❤️'
                            }
                        ].map((item, index) => (
                            <div key={index} className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent-red/30 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent-green/30 rounded-full blur-3xl"></div>

                        <div className="relative p-12 md:p-20 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                                Ready to make a difference?
                            </h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                Whether you play, shop, or speak out — your contribution matters. Join the Bao Kibao family today.
                            </p>
                            <Link to="/tournaments" className="inline-block px-10 py-4 bg-white text-gray-900 font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                                Get Involved Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
