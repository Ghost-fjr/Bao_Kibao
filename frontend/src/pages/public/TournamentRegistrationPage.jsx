import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TournamentRegistrationPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        captain_name: '',
        captain_phone: '',
        captain_email: '',
        alt_contact_person: '',
        alt_contact_phone: '',
        accepted_rules: false,
        mpesa_confirmation_code: '',
        mpesa_name: '',
        players: Array(10).fill({ name: '' })
    });

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                const response = await axios.get(`${API_URL}/tournaments/${id}/`);
                setTournament(response.data);
                
                // If there's only one category, auto-select it
                if (response.data.categories?.length === 1) {
                    setFormData(prev => ({ ...prev, category: response.data.categories[0].id }));
                }
            } catch (err) {
                toast.error('Failed to load tournament details.');
                navigate('/tournaments');
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePlayerChange = (index, value) => {
        const newPlayers = [...formData.players];
        newPlayers[index] = { name: value };
        setFormData(prev => ({ ...prev, players: newPlayers }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.accepted_rules) {
            toast.error('You must accept the tournament rules to proceed.');
            return;
        }

        if (!formData.category) {
            toast.error('Please select a team category.');
            return;
        }

        // Filter out empty player names
        const filledPlayers = formData.players.filter(p => p.name.trim() !== '');
        if (filledPlayers.length < 7) {
            toast.error('You must register at least 7 players (Starting squad).');
            return;
        }

        setSubmitting(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            await axios.post(`${API_URL}/tournaments/${id}/register_team/`, {
                ...formData,
                players: filledPlayers
            });
            
            toast.success('Team registered successfully! We will review your payment shortly.');
            navigate(`/tournaments/${id}`);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData) {
                // Show the first error from validation response
                const firstKey = Object.keys(errorData)[0];
                toast.error(`${firstKey}: ${errorData[firstKey][0] || errorData[firstKey]}`);
            } else {
                toast.error('Registration failed. Please check your inputs and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    if (!tournament) return null;

    return (
        <div className="min-h-screen bg-neutral-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-4xl font-extrabold text-white uppercase tracking-wider mb-2">
                        {tournament.name}
                    </h1>
                    <h2 className="text-xl text-primary-400 font-semibold tracking-wide">
                        7-a-Side Football Tournament | Registration Form
                    </h2>
                    <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-neutral-400">
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(tournament.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {tournament.venue}
                        </span>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* SECTION A: TEAM & CAPTAIN DETAILS */}
                    <div className="bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">
                        <div className="bg-neutral-700/50 px-6 py-4 border-b border-neutral-700">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Section A: Team & Captain Details</h3>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* 1. Team Information */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-primary-400">1. Team Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Team Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                            placeholder="Enter team name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Category *</label>
                                        <select
                                            name="category"
                                            required
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
                                        >
                                            <option value="">Select Category...</option>
                                            {tournament.categories?.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Captain Details */}
                            <div className="space-y-4 pt-4 border-t border-neutral-700/50">
                                <h4 className="text-lg font-semibold text-primary-400">2. Captain / Manager Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Captain's Full Name *</label>
                                        <input
                                            type="text"
                                            name="captain_name"
                                            required
                                            value={formData.captain_name}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="captain_phone"
                                            required
                                            value={formData.captain_phone}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g. 0712345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Email Address *</label>
                                        <input
                                            type="email"
                                            name="captain_email"
                                            required
                                            value={formData.captain_email}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="captain@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Alt. Contact Person</label>
                                        <input
                                            type="text"
                                            name="alt_contact_person"
                                            value={formData.alt_contact_person}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-300 mb-2">Alt. Contact Number</label>
                                        <input
                                            type="tel"
                                            name="alt_contact_phone"
                                            value={formData.alt_contact_phone}
                                            onChange={handleChange}
                                            className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            placeholder="e.g. 0712345678"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Squad Roster */}
                            <div className="space-y-4 pt-4 border-t border-neutral-700/50">
                                <h4 className="text-lg font-semibold text-primary-400">3. Squad Roster</h4>
                                <p className="text-sm text-neutral-400 mb-4">Maximum 10 players: 7 starting, 3 substitutes. You must register at least 7 players.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.players.map((player, index) => {
                                        let labelSuffix = '';
                                        if (index === 0) labelSuffix = '(Goalkeeper)';
                                        else if (index >= 7) labelSuffix = `(Sub ${index - 6})`;
                                        
                                        return (
                                            <div key={index} className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded bg-neutral-700 flex items-center justify-center text-neutral-300 font-bold shrink-0">
                                                    {index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={player.name}
                                                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                                                    required={index < 7} // First 7 are required
                                                    className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                    placeholder={`Player Full Name ${labelSuffix}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION B: TOURNAMENT RULES */}
                    <div className="bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">
                        <div className="bg-neutral-700/50 px-6 py-4 border-b border-neutral-700">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Section B: Rules & Regulations</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-700 text-sm text-neutral-300 space-y-4 mb-6 h-48 overflow-y-auto custom-scrollbar">
                                <p><strong>Tournament Format:</strong> Matches will be played in a 7-a-side format.</p>
                                <p><strong>Punctuality:</strong> Teams must arrive at {tournament.venue || 'the venue'} at least 30 minutes before their scheduled kickoff. Late arrivals may result in a walkover.</p>
                                <p><strong>Code of Conduct:</strong> Bao Kibao is built on Unity, Competition, and Purpose. Violence, foul language, or unsportsmanlike behavior toward referees, opponents, or organizers will result in immediate team disqualification and may involve law enforcement.</p>
                                
                                <div>
                                    <strong>Prizes & Awards:</strong>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-400">
                                        <li>1st Place: 20,000 KSH + Trophy + Certificate</li>
                                        <li>2nd Place: 15,000 KSH + Certificate</li>
                                        <li>3rd Place: 10,000 KSH + Certificate</li>
                                    </ul>
                                </div>
                                
                                <p><strong>Humanitarian Focus:</strong> This is a "Kick for Gaza" initiative. All proceeds go toward supporting humanitarian aid.</p>
                            </div>

                            <label className="flex items-start space-x-3 cursor-pointer group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        name="accepted_rules"
                                        required
                                        checked={formData.accepted_rules}
                                        onChange={handleChange}
                                        className="w-5 h-5 bg-neutral-900 border-2 border-neutral-500 rounded text-primary-500 focus:ring-primary-500 focus:ring-offset-neutral-800 cursor-pointer"
                                    />
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-white">Captain's Declaration</span>
                                    <p className="text-neutral-400 mt-1">
                                        I confirm that all team members have read, understood, and agreed to the Bao Kibao tournament rules.
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* SECTION C: PAYMENT & SUBMIT */}
                    <div className="bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700">
                        <div className="bg-neutral-700/50 px-6 py-4 border-b border-neutral-700">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Section C: Payment & Submit</h3>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-primary-900/20 border border-primary-500/30 rounded-lg p-5">
                                <p className="text-primary-100 text-sm mb-4">
                                    To officially secure your team's limited slot, the non-refundable registration fee of <strong>2,500 KSH</strong> must be paid while filling this form as commitment and the rest on or before the start of the tournament.
                                </p>
                                
                                <div className="bg-neutral-900 p-4 rounded-md border border-neutral-700 font-mono text-sm space-y-2">
                                    <p className="text-neutral-400">1. Go to M-PESA &gt; <span className="text-white">Send Money</span></p>
                                    <p className="text-neutral-400">2. Enter Phone Number: <span className="text-white text-lg font-bold">0718183108</span></p>
                                    <p className="text-neutral-400">3. Enter Amount: <span className="text-white font-bold">2500</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">M-PESA Confirmation Code *</label>
                                    <input
                                        type="text"
                                        name="mpesa_confirmation_code"
                                        required
                                        value={formData.mpesa_confirmation_code}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono uppercase"
                                        placeholder="e.g. SGR8A9XYZ"
                                    />
                                    <p className="mt-1 text-xs text-neutral-500">The 10-character code from your M-PESA SMS.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Name Registered to M-PESA *</label>
                                    <input
                                        type="text"
                                        name="mpesa_name"
                                        required
                                        value={formData.mpesa_name}
                                        onChange={handleChange}
                                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
                                        placeholder="e.g. JOHN DOE"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 transition-all flex justify-center items-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Registration...
                                        </>
                                    ) : (
                                        'Submit Registration'
                                    )}
                                </button>
                                <p className="text-center text-sm text-neutral-500 mt-4">
                                    By submitting, you agree to the tournament rules and confirm payment has been made.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TournamentRegistrationPage;
