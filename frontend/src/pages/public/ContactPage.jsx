import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundElements from '../../components/common/BackgroundElements';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock submission
        setStatus('Sending...');
        setTimeout(() => {
            setStatus('Sent!');
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus(''), 3000);
        }, 1500);
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-gradient-to-b from-accent-red/70 via-accent-black/70 to-accent-green/70 relative overflow-hidden min-h-screen py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-accent-red selection:text-white">
            <BackgroundElements />

            <div className="max-w-6xl mx-auto relative z-10 mt-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-green to-accent-red">Touch</span>
                    </h1>
                    <p className="mt-4 text-xl text-gray-800 font-bold drop-shadow-md">
                        We'd love to hear from you. Let's make a difference together.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-accent-red rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 h-full">
                            <h2 className="text-3xl font-black text-gray-900 mb-8">Contact Information</h2>
                            <div className="space-y-8">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-12 h-12 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900">Email</h3>
                                        <p className="mt-1 text-gray-600 font-medium">baokibao.org@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center text-accent-red">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900">Phone</h3>
                                        <p className="mt-1 text-gray-600 font-medium">0718-183-108 / 0704-667-311</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <h3 className="text-lg font-bold text-gray-900">Location</h3>
                                        <p className="mt-1 text-gray-600 font-medium">Nairobi, Kenya</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="group relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-red to-accent-black rounded-3xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all" required placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all" required placeholder="your.email@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                                    <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all" required placeholder="How can we help?" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Message</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange} rows="4" className="appearance-none block w-full px-4 py-3 rounded-xl border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-green/20 focus:border-accent-green transition-all resize-none" required placeholder="Write your message here..."></textarea>
                                </div>
                                <button type="submit" disabled={!!status} className={`w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-accent-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-black shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${status ? 'opacity-75 cursor-not-allowed' : ''}`}>
                                    {status || 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
