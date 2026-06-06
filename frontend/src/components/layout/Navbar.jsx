import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-palestine shadow-lg fixed w-full top-0 z-50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center space-x-3 group">
                            <div className="relative w-12 h-12 bg-white rounded-full p-1 shadow-md group-hover:scale-105 transition-transform duration-300">
                                <img src="/logo.jpg" alt="Bao Kibao" className="h-full w-full object-cover rounded-full" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tight group-hover:text-gray-100 transition-colors">
                                    BAO KIBAO
                                </span>
                                <span className="text-xs text-gray-200 font-bold tracking-widest uppercase">
                                    KICK FOR GAZA
                                </span>
                            </div>
                        </Link>
                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            {[
                                { path: '/', label: 'Home' },
                                { path: '/tournaments', label: 'Tournaments' },
                                { path: '/gallery', label: 'Gallery' },
                                { path: '/achievements', label: 'Achievements' },
                                { path: '/store', label: 'Store' }
                            ].map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                                        isActive(item.path) ? 'text-accent-red bg-white shadow-md' : 'text-white hover:bg-white/10'
                                    }`}
                                >
                                    {item.label}
                                    {isActive(item.path) && (
                                        <motion.div
                                            layoutId="navbar-active"
                                            className="absolute inset-0 bg-white rounded-lg -z-10 shadow-sm"
                                            initial={false}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:ml-6 md:flex md:items-center space-x-4">
                        <Link to="/login" className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-bold transition-colors duration-200">
                            Log in
                        </Link>
                        <Link to="/register" className="bg-white text-accent-red hover:bg-gray-100 px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-gray-200 hover:bg-white/10 focus:outline-none transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 absolute w-full shadow-xl overflow-hidden"
                    >
                        <div className="pt-2 pb-3 space-y-1">
                            {[
                                { path: '/', label: 'Home' },
                                { path: '/tournaments', label: 'Tournaments' },
                                { path: '/gallery', label: 'Gallery' },
                                { path: '/achievements', label: 'Achievements' },
                                { path: '/store', label: 'Store' }
                            ].map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path} 
                                    onClick={() => setIsOpen(false)} 
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                                        isActive(item.path) ? 'border-accent-red text-accent-red bg-red-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="pt-4 pb-6 border-t border-gray-200">
                            <div className="flex flex-col px-4 space-y-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 border border-gray-300 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-palestine shadow-lg hover:shadow-xl transition-all">
                                    Sign up
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
