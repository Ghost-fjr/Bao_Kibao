import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-white border-white' : 'text-gray-200 hover:text-white border-transparent hover:border-gray-200';
    };

    return (
        <nav className="bg-gradient-palestine shadow-lg sticky top-0 z-50">
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
                            <Link to="/" className={`${isActive('/')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200`}>
                                Home
                            </Link>
                            <Link to="/tournaments" className={`${isActive('/tournaments')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200`}>
                                Tournaments
                            </Link>
                            <Link to="/gallery" className={`${isActive('/gallery')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200`}>
                                Gallery
                            </Link>
                            <Link to="/achievements" className={`${isActive('/achievements')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200`}>
                                Achievements
                            </Link>
                            <Link to="/store" className={`${isActive('/store')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-bold transition-all duration-200`}>
                                Store
                            </Link>
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
                            {isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 absolute w-full shadow-xl">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/" onClick={() => setIsOpen(false)} className="border-accent-red text-accent-red block pl-3 pr-4 py-2 border-l-4 text-base font-bold bg-red-50">
                            Home
                        </Link>
                        <Link to="/tournaments" onClick={() => setIsOpen(false)} className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Tournaments
                        </Link>
                        <Link to="/gallery" onClick={() => setIsOpen(false)} className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Gallery
                        </Link>
                        <Link to="/achievements" onClick={() => setIsOpen(false)} className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Achievements
                        </Link>
                        <Link to="/store" onClick={() => setIsOpen(false)} className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                            Store
                        </Link>
                    </div>
                    <div className="pt-4 pb-6 border-t border-gray-200">
                        <div className="flex items-center px-4 space-x-3">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 border border-gray-300 text-base font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
                                Log in
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center px-4 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-palestine shadow-lg hover:shadow-xl transition-all">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
