import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackgroundElements from '../../components/common/BackgroundElements';

const LandingPage = () => {
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="bg-gradient-to-b from-accent-red/70 via-accent-black/70 to-accent-green/70 relative overflow-hidden min-h-screen">
            {/* Background Elements */}
            <BackgroundElements />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-white via-gray-50 to-accent-red/70 pt-24 md:pt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                        <motion.main 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
                        >
                            <div className="sm:text-center lg:text-left">
                                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-tight">
                                    Bao <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Kibao.</span><br />
                                    Football for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-600">Humanity.</span>
                                </motion.h1>
                                <motion.p variants={itemVariants} className="mt-6 text-xl md:text-2xl text-gray-600 leading-relaxed font-light sm:max-w-xl sm:mx-auto md:mt-8 lg:mx-0">
                                    Bao Kibao is a movement. We unite communities through the beautiful game, raising voices and funds for those who need it most.
                                </motion.p>
                                <motion.div variants={itemVariants} className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                                    <Link to="/tournaments" className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:bg-gray-800 transition-all transform hover:-translate-y-1">
                                        Join Tournaments
                                    </Link>
                                    <Link to="/store" className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold text-lg shadow-lg hover:shadow-xl border border-gray-100 hover:border-gray-200 transition-all transform hover:-translate-y-1">
                                        Shop for Gaza
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.main>
                    </div>
                </div>
                <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                    <motion.img
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
                        src="/front.png"
                        alt="Football match"
                        style={{ transformOrigin: "center" }}
                    />
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div className="relative z-10 py-16 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                        className="text-center mb-16"
                    >
                        <motion.span variants={itemVariants} className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                            Est. 2024
                        </motion.span>
                        <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-6">
                            Kick for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Gaza.</span><br />
                            Stand for <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-emerald-600">Humanity.</span>
                        </motion.h2>
                        <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                            Bao Kibao is a youth-led movement using football to unite communities and stand in solidarity with Palestine. We host tournaments, raise awareness about boycotting aggressive brands, and fundraise directly for Gaza. Every match, merchandise, and voice counts
                        </motion.p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Mission */}
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6 }}
                            className="group relative"
                        >
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
                        </motion.div>

                        {/* Vision */}
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="group relative"
                        >
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
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* What We Do Section */}
            <div className="relative z-10 py-24 bg-gradient-to-r from-accent-green/70 via-white to-accent-black/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <motion.h2 
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                        >
                            What We Do
                        </motion.h2>
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-24 h-1.5 bg-gradient-to-r from-accent-red via-black to-accent-green mx-auto rounded-full origin-left"
                        ></motion.div>
                    </div>

                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {[
                            {
                                title: 'Football for a Cause',
                                desc: '7-a-side tournaments uniting youth for a purpose.',
                                gradient: 'from-orange-600 to-pink-800',
                                glow: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
                                icon: '⚽'
                            },
                            {
                                title: 'Merch for Palestine',
                                desc: '100% of profits go directly to Gaza relief efforts.',
                                gradient: 'from-green-600 to-emerald-800',
                                glow: 'group-hover:shadow-[0_0_30px_rgba(22,163,74,0.4)]',
                                icon: '🏴'
                            },
                            {
                                title: 'Boycott Awareness',
                                desc: 'Educating on ethical consumption and resistance.',
                                gradient: 'from-gray-600 to-black',
                                glow: 'group-hover:shadow-[0_0_30px_rgba(75,85,99,0.4)]',
                                icon: '🚫'
                            },
                            {
                                title: 'Community Engagement',
                                desc: 'Empowering local youth through solidarity.',
                                gradient: 'from-blue-600 to-indigo-800',
                                glow: 'group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]',
                                icon: '❤️'
                            }
                        ].map((item, index) => (
                            <motion.div 
                                variants={itemVariants}
                                key={index} 
                                className={`group bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-lg transition-all duration-300 hover:-translate-y-2 border border-white/40 ${item.glow}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-[0.03] rounded-3xl transition-opacity duration-300`}></div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black"></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-accent-red/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-accent-green/20 rounded-full blur-3xl"></div>

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
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
