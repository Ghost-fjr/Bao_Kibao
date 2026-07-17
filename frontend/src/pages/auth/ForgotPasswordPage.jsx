import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setStatus('loading');
        
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            await axios.post(`${API_URL}/api/auth/password-reset/`, { email });
            
            setStatus('success');
            toast.success('Password reset link sent!');
        } catch (err) {
            setStatus('idle');
            // Show generic message even if failed to prevent email enumeration
            toast.success('If the email exists, a reset link will be sent.');
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-neutral-800 p-8 rounded-xl shadow-xl"
            >
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-white">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-neutral-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-6">
                        <div className="bg-primary-900/50 p-4 rounded-lg border border-primary-500/30">
                            <p className="text-primary-200">
                                If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 mt-1 border border-neutral-600 bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {status === 'loading' ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Send Reset Link'}
                            </button>
                        </div>
                        
                        <div className="text-center">
                            <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
                                Back to login
                            </Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
