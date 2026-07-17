import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email address...');

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Adjust the baseURL if necessary, typically axios is configured elsewhere
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                await axios.get(`${API_URL}/api/auth/verify-email/${token}/`);
                
                setStatus('success');
                setMessage('Your email has been successfully verified! You can now log in.');
                toast.success('Email verified successfully!');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Verification failed. The link might be invalid or expired.');
                toast.error('Verification failed');
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-neutral-800 p-8 rounded-xl shadow-xl text-center"
            >
                <div className="mb-6 flex justify-center">
                    {status === 'verifying' && (
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                    )}
                    {status === 'success' && (
                        <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {status === 'error' && (
                        <svg className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </div>

                <h2 className="text-3xl font-extrabold text-white mb-4">
                    Email Verification
                </h2>
                
                <p className={`text-lg mb-8 ${status === 'error' ? 'text-red-400' : 'text-neutral-300'}`}>
                    {message}
                </p>

                <div className="space-y-4">
                    {status === 'success' ? (
                        <Link
                            to="/login"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Proceed to Login
                        </Link>
                    ) : (
                        <Link
                            to="/"
                            className="w-full flex justify-center py-3 px-4 border border-neutral-700 rounded-lg shadow-sm text-sm font-medium text-white bg-neutral-800 hover:bg-neutral-700"
                        >
                            Return to Home
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmailPage;
